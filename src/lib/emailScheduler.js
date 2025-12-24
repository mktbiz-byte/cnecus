import { database } from './supabase'

/**
 * Campaign Deadline Reminder Automation System
 * Does not send reminders to users who have already submitted their videos
 */
class EmailScheduler {
  constructor() {
    this.isRunning = false
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Email scheduler started')

    // Run daily at 9 AM (US Eastern time)
    this.scheduleDaily()

    // Run immediately once
    this.checkAndSendReminders()
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.isRunning = false
    console.log('Email scheduler stopped')
  }

  /**
   * Set up daily execution schedule
   */
  scheduleDaily() {
    // Run every 24 hours (86400000ms)
    this.interval = setInterval(() => {
      this.checkAndSendReminders()
    }, 24 * 60 * 60 * 1000)
  }

  /**
   * Check and send deadline reminders
   */
  async checkAndSendReminders() {
    try {
      console.log('Checking deadline reminders...')

      // Get active campaigns
      const campaigns = await database.campaigns.getAll()
      const activeCampaigns = campaigns.filter(c => c.status === 'active')

      for (const campaign of activeCampaigns) {
        await this.processCampaignReminders(campaign)
      }

      console.log('Deadline reminder check complete')
    } catch (error) {
      console.error('Error checking deadline reminders:', error)
    }
  }

  /**
   * Process reminders for a specific campaign
   */
  async processCampaignReminders(campaign) {
    try {
      const deadline = new Date(campaign.end_date)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

      console.log(`Campaign "${campaign.title}" - ${daysUntilDeadline} days until deadline`)

      // Determine template ID based on days until deadline
      let templateId = null
      if (daysUntilDeadline === 3) {
        templateId = 'campaign_deadline_3days'
      } else if (daysUntilDeadline === 2) {
        templateId = 'campaign_deadline_2days'
      } else if (daysUntilDeadline === 1) {
        templateId = 'campaign_deadline_1day'
      } else if (daysUntilDeadline === 0) {
        templateId = 'campaign_deadline_today'
      }

      if (!templateId) return

      // Get approved applications for this campaign
      const applications = await database.applications.getByCampaignId(campaign.id)
      const approvedApplications = applications.filter(app => app.status === 'approved')

      for (const application of approvedApplications) {
        await this.sendReminderIfNeeded(campaign, application, templateId)
      }

    } catch (error) {
      console.error(`Error processing reminders for campaign ${campaign.id}:`, error)
    }
  }

  /**
   * Send reminder only if needed
   */
  async sendReminderIfNeeded(campaign, application, templateId) {
    try {
      // Check if video has been submitted
      const hasSubmittedVideo = await this.checkVideoSubmission(application)

      if (hasSubmittedVideo) {
        console.log(`User ${application.user_id} has already submitted video - skipping reminder`)
        return
      }

      // Check if reminder was already sent today with same template
      const alreadySent = await this.checkIfAlreadySent(application.user_id, campaign.id, templateId)

      if (alreadySent) {
        console.log(`User ${application.user_id} already received ${templateId} reminder`)
        return
      }

      // Get user information
      const user = await database.users.getById(application.user_id)
      if (!user) return

      // Send email
      await this.sendReminderEmail(user, campaign, application, templateId)

      // Record sent email
      await this.recordEmailSent(user.id, campaign.id, templateId)

    } catch (error) {
      console.error('Error checking reminder send:', error)
    }
  }

  /**
   * Check if video has been submitted
   */
  async checkVideoSubmission(application) {
    try {
      // Check application's video_url or submission_status
      if (application.video_url || application.submission_status === 'submitted') {
        return true
      }

      // Additional check for file uploads table (if exists)
      // const uploads = await database.uploads.getByApplicationId(application.id)
      // return uploads && uploads.length > 0

      return false
    } catch (error) {
      console.error('Error checking video submission:', error)
      return false
    }
  }

  /**
   * Check if reminder was already sent
   */
  async checkIfAlreadySent(userId, campaignId, templateId) {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Check in email_logs table (if exists)
      const { data, error } = await database.supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .eq('template_id', templateId)
        .gte('sent_at', today)
        .limit(1)

      if (error && error.code !== 'PGRST116') { // Not a missing table error
        console.error('Error checking email logs:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error checking email send history:', error)
      return false
    }
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(user, campaign, application, templateId) {
    try {
      // Get email template
      const template = await this.getEmailTemplate(templateId)
      if (!template) {
        console.error(`Template ${templateId} not found`)
        return
      }

      // Replace template variables
      const emailContent = this.replaceTemplateVariables(template.content, {
        name: user.name || user.email,
        campaign_title: campaign.title,
        brand_name: campaign.brand,
        reward_amount: campaign.reward_amount,
        deadline: this.formatDate(campaign.end_date),
        requirements: campaign.requirements || 'Please review the campaign guidelines',
        upload_folder: campaign.upload_folder || 'Google Drive folder link',
        guidelines_url: campaign.guidelines_url || '#'
      })

      const emailSubject = this.replaceTemplateVariables(template.subject, {
        campaign_title: campaign.title
      })

      // Send actual email (requires email service integration)
      await this.sendEmail({
        to: user.email,
        subject: emailSubject,
        content: emailContent
      })

      console.log(`Sent ${templateId} reminder to ${user.email}`)

    } catch (error) {
      console.error('Error sending reminder email:', error)
    }
  }

  /**
   * Get email template
   */
  async getEmailTemplate(templateId) {
    try {
      const { data, error } = await database.supabase
        .from('email_templates')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching template:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting template:', error)
      return null
    }
  }

  /**
   * Replace template variables
   */
  replaceTemplateVariables(template, variables) {
    let result = template

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, variables[key] || '')
    })

    return result
  }

  /**
   * Format date for US locale
   */
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  /**
   * Send actual email (requires implementation)
   */
  async sendEmail({ to, subject, content }) {
    // Requires actual email service integration (SendGrid, AWS SES, etc.)
    console.log('Sending email:', { to, subject })
    console.log('Content:', content)

    // In development, only log to console
    if (process.env.NODE_ENV === 'development') {
      return true
    }

    // Implement actual email sending logic
    // await emailService.send({ to, subject, html: content })
  }

  /**
   * Record email sent
   */
  async recordEmailSent(userId, campaignId, templateId) {
    try {
      const { error } = await database.supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          template_id: templateId,
          sent_at: new Date().toISOString()
        })

      if (error && error.code !== 'PGRST116') { // Not a missing table error
        console.error('Error saving email log:', error)
      }
    } catch (error) {
      console.error('Error recording email sent:', error)
    }
  }
}

// Singleton instance
const emailScheduler = new EmailScheduler()

export default emailScheduler
