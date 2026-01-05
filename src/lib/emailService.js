// Email Service for CNEC US Platform
import { supabase } from './supabase'

// Email Templates - US English Version
const EMAIL_TEMPLATES = {
  // 1. Signup Complete
  SIGNUP_COMPLETE: {
    subject: '[CNEC US] Welcome! Your account has been created',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Registration Complete</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight { background: #f0f8ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CNEC US</h1>
            <p>K-Beauty x Short-Form Video Platform</p>
        </div>
        <div class="content">
            <h2>Welcome to CNEC US!</h2>
            <p>Hi ${data.name},</p>

            <p>Thank you for joining CNEC US!<br>
            Your account has been successfully created.</p>

            <div class="highlight">
                <h3>Account Information</h3>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <h3>Next Steps</h3>
            <ol>
                <li><strong>Complete Your Profile:</strong> Add your social media accounts and details</li>
                <li><strong>Browse Campaigns:</strong> Apply to K-Beauty campaigns that interest you</li>
                <li><strong>Create Content:</strong> After approval, create engaging video content</li>
                <li><strong>Earn Rewards:</strong> Get paid directly to your US bank account</li>
            </ol>

            <div style="text-align: center;">
                <a href="https://cnec-us.com/" class="button">View My Dashboard</a>
            </div>

            <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
            <p>This is an automated email.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 2. Campaign Application Submitted
  APPLICATION_SUBMITTED: {
    subject: '[CNEC US] Your campaign application has been received',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Application Submitted</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .campaign-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status-badge { background: #ffd700; color: #333; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CNEC US</h1>
            <p>Application Received</p>
        </div>
        <div class="content">
            <h2>Your application has been submitted!</h2>
            <p>Hi ${data.name},</p>

            <p>We've received your application for the campaign below.<br>
            You'll hear back from us within 2-3 business days.</p>

            <div class="campaign-info">
                <h3>Campaign Details</h3>
                <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                <p><strong>Brand:</strong> ${data.brandName}</p>
                <p><strong>Reward:</strong> $${data.rewardAmount}</p>
                <p><strong>Applied:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Status:</strong> <span class="status-badge">Under Review</span></p>
            </div>

            <h3>What You Submitted</h3>
            <ul>
                <li>Basic information (name, age, contact)</li>
                <li>Skin type and concerns</li>
                <li>Shipping address</li>
                <li>Social media accounts</li>
                <li>Application motivation and ideas</li>
            </ul>

            <h3>Review Process</h3>
            <p>We evaluate applications based on:</p>
            <ul>
                <li>Social media account activity</li>
                <li>Follower count and engagement rate</li>
                <li>Content quality and consistency</li>
                <li>Brand fit</li>
            </ul>

            <p>We'll notify you of the results via email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 3. Campaign Application Approved
  APPLICATION_APPROVED: {
    subject: '[CNEC US] Congratulations! You\'ve been selected for a campaign!',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - You're Selected!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .deadline-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations!</h1>
            <p>You've been selected for a campaign</p>
        </div>
        <div class="content">
            <div class="success-box">
                <h2>${data.campaignTitle}</h2>
                <p><strong>${data.name}, you've been officially selected for this campaign!</strong></p>
            </div>

            <h3>Important Dates</h3>
            <div class="deadline-box">
                <p><strong>Submission Deadline:</strong> ${data.deadline}</p>
                <p><strong>Expected Shipping:</strong> ${data.shippingDate}</p>
                <p><strong>Reward:</strong> $${data.rewardAmount}</p>
            </div>

            <h3>Next Steps</h3>
            <ol>
                <li><strong>Review Campaign Materials</strong><br>
                    Download guidelines and assets from the links below</li>
                <li><strong>Receive Your Products</strong><br>
                    We'll ship to your registered address</li>
                <li><strong>Create Content</strong><br>
                    Follow the guidelines to create engaging video content</li>
                <li><strong>Post to Social Media</strong><br>
                    Use the required hashtags when posting</li>
                <li><strong>Submit Your Post URL</strong><br>
                    Report your post URL through your dashboard</li>
            </ol>

            <div style="text-align: center;">
                ${data.googleDriveLink ? `<a href="${data.googleDriveLink}" class="button">Google Drive</a>` : ''}
                ${data.googleSlidesLink ? `<a href="${data.googleSlidesLink}" class="button">Google Slides</a>` : ''}
                <a href="https://cnec-us.com/mypage" class="button">My Dashboard</a>
            </div>

            <h3>Important Notes</h3>
            <ul>
                <li>Please meet the submission deadline</li>
                <li>Follow the content guidelines</li>
                <li>Required hashtags must be used</li>
                <li>Submit your post URL after publishing</li>
            </ul>

            <p>If you have any questions, please reach out to us anytime.<br>
            We look forward to seeing your amazing content!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 3.5. Contact Information Request (for confirmed creators)
  CONTACT_INFO_REQUEST: {
    subject: '[CNEC US] Action Required: Please submit your shipping address',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Shipping Address Required</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
        .info-box { background: #f0f8ff; border: 1px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations!</h1>
            <p>You have been selected for the campaign</p>
        </div>
        <div class="content">
            <h2>Hi ${data.name},</h2>

            <p>Great news! You have been <span class="highlight">officially confirmed</span> for the <strong>${data.campaignTitle}</strong> campaign!</p>

            <div class="info-box">
                <h3>Campaign Details</h3>
                <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                <p><strong>Brand:</strong> ${data.brandName || 'N/A'}</p>
                <p><strong>Reward:</strong> $${data.rewardAmount || 'TBD'}</p>
            </div>

            <h3>Action Required</h3>
            <p>To receive your campaign products, we need your <strong>shipping address</strong> and <strong>phone number</strong>.</p>
            <p>Please click the button below to submit your contact information:</p>

            <div style="text-align: center;">
                <a href="${data.contactFormUrl}" class="button">Submit Contact Information</a>
            </div>

            <p style="color: #666; font-size: 14px;">
                This link is unique to your application. Please do not share it with others.
            </p>

            <h3>What's Next?</h3>
            <ol>
                <li>Submit your contact information (phone & address)</li>
                <li>We will ship the products to your address</li>
                <li>Create amazing content following the campaign guidelines</li>
                <li>Post and submit your content URL</li>
                <li>Receive your reward!</li>
            </ol>

            <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
            <p>This is an automated email.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 4. Campaign Guide Delivered
  GUIDE_DELIVERED: {
    subject: '[CNEC US] Your campaign materials are ready!',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Campaign Guide</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .guide-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Campaign Materials Ready</h1>
            <p>Everything you need for your content</p>
        </div>
        <div class="content">
            <h2>Your campaign materials are ready!</h2>
            <p>Hi ${data.name},</p>

            <p>The materials and guidelines for <strong>${data.campaignTitle}</strong> are now available.<br>
            Please download everything you need from the links below.</p>

            <div class="guide-box">
                <h3>Available Materials</h3>
                <ul>
                    <li>Campaign Guidelines</li>
                    <li>Brand Assets & Logos</li>
                    <li>Posting Templates</li>
                    <li>Required Hashtag List</li>
                    <li>Product Information & Features</li>
                    <li>Reference Videos & Examples</li>
                </ul>
            </div>

            <div style="text-align: center;">
                ${data.googleDriveLink ? `<a href="${data.googleDriveLink}" class="button">Open Google Drive</a>` : ''}
                ${data.googleSlidesLink ? `<a href="${data.googleSlidesLink}" class="button">Open Google Slides</a>` : ''}
            </div>

            <h3>Schedule Reminder</h3>
            <ul>
                <li><strong>Product Shipping:</strong> ${data.shippingDate}</li>
                <li><strong>Submission Deadline:</strong> ${data.deadline}</li>
                <li><strong>3-Day Reminder:</strong> ${data.reminder3Days}</li>
                <li><strong>1-Day Reminder:</strong> ${data.reminder1Day}</li>
            </ul>

            <h3>Content Tips</h3>
            <ul>
                <li>Read the guidelines carefully</li>
                <li>Stay true to the brand's aesthetic</li>
                <li>Showcase the product naturally</li>
                <li>Don't forget the required hashtags</li>
            </ul>

            <p>Please review the materials and create amazing content!<br>
            Reach out if you have any questions.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 5. Deadline Reminder - 3 Days
  DEADLINE_REMINDER_3DAYS: {
    subject: '[CNEC US] Reminder: 3 days until submission deadline',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - 3 Day Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #fd7e14; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .countdown { font-size: 2em; font-weight: bold; color: #fd7e14; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Deadline Reminder</h1>
            <p>3 days remaining</p>
        </div>
        <div class="content">
            <div class="countdown">3 Days Left</div>

            <h2>Your deadline is approaching</h2>
            <p>Hi ${data.name},</p>

            <p>Just a friendly reminder that the submission deadline for <strong>${data.campaignTitle}</strong> is in <strong>3 days</strong>.<br>
            How's your content coming along?</p>

            <div class="warning-box">
                <h3>Important Dates</h3>
                <p><strong>Deadline:</strong> ${data.deadline}</p>
                <p><strong>Time Remaining:</strong> 3 days</p>
                <p><strong>Reward:</strong> $${data.rewardAmount}</p>
            </div>

            <h3>Pre-Submission Checklist</h3>
            <ul>
                <li>Content follows the guidelines</li>
                <li>Product is featured prominently</li>
                <li>Required hashtags are included</li>
                <li>Caption includes necessary information</li>
                <li>Video quality is good</li>
            </ul>

            <h3>After Posting</h3>
            <ol>
                <li>Post your video to social media</li>
                <li>Copy the post URL</li>
                <li>Submit the URL through your dashboard</li>
                <li>Wait for reward confirmation</li>
            </ol>

            <div style="text-align: center;">
                <a href="https://cnec-us.com/mypage" class="button">Submit Post URL</a>
                ${data.googleDriveLink ? `<a href="${data.googleDriveLink}" class="button">View Materials</a>` : ''}
            </div>

            <p>If you haven't posted yet, please submit your content soon.<br>
            Need help? We're here for you!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 6. Deadline Reminder - 1 Day
  DEADLINE_REMINDER_1DAY: {
    subject: '[CNEC US] URGENT: 1 day until submission deadline',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Final Reminder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
        .urgent-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .countdown { font-size: 2.5em; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Final Reminder</h1>
            <p>Only 1 day left!</p>
        </div>
        <div class="content">
            <div class="countdown">1 Day Left!</div>

            <h2>Your deadline is tomorrow</h2>
            <p>Hi ${data.name},</p>

            <div class="urgent-box">
                <h3>Urgent: Deadline Approaching</h3>
                <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                <p><strong>Deadline:</strong> ${data.deadline}</p>
                <p><strong>Time Remaining:</strong> ~24 hours</p>
                <p><strong>Reward:</strong> $${data.rewardAmount}</p>
            </div>

            <p>If you haven't posted yet, we <strong>strongly recommend</strong> submitting your content today.<br>
            Late submissions may not qualify for payment.</p>

            <h3>What You Need to Do Now</h3>
            <ol>
                <li><strong>Finalize Your Video</strong> - Check quality and guidelines</li>
                <li><strong>Post to Social Media</strong> - Don't forget the hashtags</li>
                <li><strong>Submit Your URL</strong> - Report through your dashboard</li>
            </ol>

            <div style="text-align: center;">
                <a href="https://cnec-us.com/mypage" class="button">Submit Now</a>
            </div>

            <h3>Need Help?</h3>
            <p>If you're experiencing technical issues or have urgent questions:</p>
            <ul>
                <li>Email: support@cnec-us.com</li>
                <li>Hours: Mon-Fri 9:00 AM - 6:00 PM EST</li>
            </ul>

            <p><strong>Important:</strong> Late submissions may not be eligible for payment.<br>
            Please submit your content on time.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 7. Deadline Day
  DEADLINE_TODAY: {
    subject: '[CNEC US] TODAY is your submission deadline!',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Deadline Today</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
        .critical-box { background: #f8d7da; border: 2px solid #dc3545; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .countdown { font-size: 3em; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DEADLINE DAY</h1>
            <p>Submit your content today!</p>
        </div>
        <div class="content">
            <div class="countdown">DUE TODAY</div>

            <div class="critical-box">
                <h2>Important: Today is your deadline</h2>
                <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                <p><strong>Deadline:</strong> ${data.deadline} by 11:59 PM</p>
                <p><strong>Reward:</strong> $${data.rewardAmount}</p>
            </div>

            <p>Hi ${data.name},</p>

            <p><strong>Today is the deadline for ${data.campaignTitle}.</strong><br>
            Please complete your post and submit the URL through your dashboard by 11:59 PM.</p>

            <h3>Action Required Now</h3>
            <ol>
                <li><strong>Post to Social Media</strong> - Use required hashtags</li>
                <li><strong>Copy Your Post URL</strong></li>
                <li><strong>Submit Through Dashboard</strong> - Before 11:59 PM</li>
            </ol>

            <div style="text-align: center;">
                <a href="https://cnec-us.com/mypage" class="button">SUBMIT NOW</a>
            </div>

            <h3>Final Checklist</h3>
            <ul>
                <li>Required hashtags included</li>
                <li>Follows content guidelines</li>
                <li>Product is visible</li>
                <li>Caption is complete</li>
                <li>URL copied correctly</li>
            </ul>

            <h3>Important Notice</h3>
            <p style="color: #dc3545; font-weight: bold;">
            Submissions after 11:59 PM may not qualify for payment.<br>
            Please submit your content and URL before the deadline.
            </p>

            <p>You've got this!<br>
            We can't wait to see your content.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 8. Point/Withdrawal Request Submitted
  POINT_REQUEST_SUBMITTED: {
    subject: '[CNEC US] Your withdrawal request has been received',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Withdrawal Request Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .point-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .process-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Withdrawal Request Received</h1>
            <p>We're processing your request</p>
        </div>
        <div class="content">
            <h2>Your withdrawal request has been submitted</h2>
            <p>Hi ${data.name},</p>

            <p>We've received your withdrawal request.<br>
            After review, we'll transfer the funds to your bank account.</p>

            <div class="point-box">
                <h3>Request Details</h3>
                <p><strong>Points:</strong> ${data.pointAmount} points</p>
                <p><strong>Amount:</strong> $${data.amount}</p>
                <p><strong>Request Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Reason:</strong> ${data.reason}</p>
            </div>

            <h3>Bank Account</h3>
            <ul>
                <li><strong>Bank:</strong> ${data.bankName}</li>
                <li><strong>Routing Number:</strong> ${data.branchName}</li>
                <li><strong>Account Number:</strong> ****${data.accountNumber.slice(-4)}</li>
                <li><strong>Account Holder:</strong> ${data.accountHolder}</li>
            </ul>

            <div class="process-box">
                <h3>Processing Timeline</h3>
                <ol>
                    <li><strong>Request Received</strong> - Complete</li>
                    <li><strong>Review</strong> - 1-2 business days</li>
                    <li><strong>Transfer Processing</strong> - 2-3 business days</li>
                    <li><strong>Deposit Complete</strong> - 3-5 business days total</li>
                </ol>
            </div>

            <h3>Expected Timeline</h3>
            <ul>
                <li><strong>Review Complete:</strong> ${data.reviewDate}</li>
                <li><strong>Transfer Date:</strong> ${data.transferDate}</li>
                <li><strong>Expected Deposit:</strong> ${data.depositDate}</li>
            </ul>

            <h3>Notifications</h3>
            <p>We'll send you email updates when:</p>
            <ul>
                <li>Your request is reviewed</li>
                <li>Transfer is processed</li>
                <li>Deposit is confirmed</li>
            </ul>

            <p>Questions? Feel free to reach out.<br>
            Thank you for being a CNEC creator!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  },

  // 9. Point Transfer/Deposit Complete
  POINT_TRANSFER_COMPLETED: {
    subject: '[CNEC US] Your payment has been deposited!',
    template: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CNEC US - Payment Complete</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .transfer-details { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .celebration { font-size: 2em; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="celebration">Congratulations!</div>
            <h1>Payment Deposited!</h1>
            <p>Your earnings have been transferred</p>
        </div>
        <div class="content">
            <div class="success-box">
                <h2>Payment Complete!</h2>
                <p><strong>Hi ${data.name},</strong></p>
                <p>Great news! Your withdrawal has been processed and deposited!</p>
            </div>

            <div class="transfer-details">
                <h3>Transfer Details</h3>
                <p><strong>Amount:</strong> $${data.amount}</p>
                <p><strong>Transfer Date:</strong> ${data.transferDate}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Bank:</strong> ${data.bankName} ${data.branchName}</p>
                <p><strong>Account:</strong> ****${data.accountNumber.slice(-4)}</p>
            </div>

            <h3>Campaign Summary</h3>
            <ul>
                <li><strong>Campaign:</strong> ${data.campaignTitle}</li>
                <li><strong>Points Earned:</strong> ${data.pointAmount} points</li>
                <li><strong>Platform:</strong> ${data.platform}</li>
                <li><strong>Post Date:</strong> ${data.postDate}</li>
            </ul>

            <h3>What's Next?</h3>
            <p>This campaign is complete. Keep creating amazing content with CNEC US!</p>

            <ul>
                <li>Browse new campaigns</li>
                <li>Grow your followers for more opportunities</li>
                <li>Improve your content quality for higher rewards</li>
                <li>Join the CNEC creator community</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://cnec-us.com/" style="display: inline-block; background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Browse New Campaigns
                </a>
            </div>

            <h3>Questions?</h3>
            <p>If you have any questions about this payment:</p>
            <ul>
                <li>Email: payments@cnec-us.com</li>
                <li>Hours: Mon-Fri 9:00 AM - 6:00 PM EST</li>
            </ul>

            <p><strong>Thank you for being a CNEC US creator!</strong><br>
            We look forward to working with you on more campaigns!</p>
        </div>
        <div class="footer">
            <p>CNEC US - K-Beauty x Short-Form Video Platform</p>
            <p>&copy; 2025 CNEC US. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Send Email Function
export const sendEmail = async (templateType, recipientEmail, data) => {
  try {
    const template = EMAIL_TEMPLATES[templateType]
    if (!template) {
      throw new Error(`Email template ${templateType} not found`)
    }

    const emailData = {
      to: recipientEmail,
      subject: template.subject,
      html: template.template(data),
      created_at: new Date().toISOString()
    }

    // Log email to Supabase
    const { data: logData, error: logError } = await supabase
      .from('email_logs')
      .insert([{
        recipient_email: recipientEmail,
        template_type: templateType,
        subject: template.subject,
        data: data,
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (logError) {
      console.error('Email log error:', logError)
    }

    // Send via Gmail SMTP - get settings from system config
    const emailSettings = JSON.parse(localStorage.getItem('cnec_email_settings') || '{}')

    if (emailSettings.smtpHost && emailSettings.smtpUser && emailSettings.smtpPass) {
      try {
        // Use Gmail direct send service
        const gmailEmailService = await import('./gmailEmailService.js')
        const emailService = gmailEmailService.default

        const result = await emailService.sendEmailDirect(
          recipientEmail,
          template.subject,
          template.template(data)
        )

        if (result.success) {
          console.log('Email sent successfully:', {
            type: templateType,
            to: recipientEmail,
            subject: template.subject,
            messageId: result.messageId
          })

          // Update log on success
          if (logData?.[0]?.id) {
            await supabase
              .from('email_logs')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                message_id: result.messageId
              })
              .eq('id', logData[0].id)
          }
        } else {
          throw new Error(result.error || 'Gmail send failed')
        }
      } catch (gmailError) {
        console.error('Gmail send error:', gmailError)
        // Log to console if Gmail fails
        console.log('Email (Gmail failed, console output):', {
          type: templateType,
          to: recipientEmail,
          subject: template.subject,
          error: gmailError.message
        })
      }
    } else {
      // Log to console if SMTP not configured
      console.log('Email (SMTP not configured, console output):', {
        type: templateType,
        to: recipientEmail,
        subject: template.subject,
        note: 'Configure Gmail SMTP in system settings to send actual emails.'
      })
    }

    return { success: true, logId: logData?.[0]?.id }

  } catch (error) {
    console.error('Send email error:', error)
    return { success: false, error: error.message }
  }
}

// Schedule Reminder Emails (for deadline reminders)
export const scheduleReminderEmails = async (campaignId, deadline) => {
  try {
    const deadlineDate = new Date(deadline)
    const now = new Date()

    // 3-day reminder schedule
    const reminder3Days = new Date(deadlineDate)
    reminder3Days.setDate(reminder3Days.getDate() - 3)

    // 1-day reminder schedule
    const reminder1Day = new Date(deadlineDate)
    reminder1Day.setDate(reminder1Day.getDate() - 1)

    // Same-day reminder schedule
    const reminderToday = new Date(deadlineDate)
    reminderToday.setHours(9, 0, 0, 0) // 9:00 AM

    const schedules = []

    // Only schedule if date is in the future
    if (reminder3Days > now) {
      schedules.push({
        campaign_id: campaignId,
        email_type: 'DEADLINE_REMINDER_3DAYS',
        scheduled_at: reminder3Days.toISOString(),
        status: 'scheduled'
      })
    }

    if (reminder1Day > now) {
      schedules.push({
        campaign_id: campaignId,
        email_type: 'DEADLINE_REMINDER_1DAY',
        scheduled_at: reminder1Day.toISOString(),
        status: 'scheduled'
      })
    }

    if (reminderToday > now) {
      schedules.push({
        campaign_id: campaignId,
        email_type: 'DEADLINE_TODAY',
        scheduled_at: reminderToday.toISOString(),
        status: 'scheduled'
      })
    }

    if (schedules.length > 0) {
      const { error } = await supabase
        .from('email_schedules')
        .insert(schedules)

      if (error) {
        console.error('Schedule email error:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true, scheduled: schedules.length }

  } catch (error) {
    console.error('Schedule reminder emails error:', error)
    return { success: false, error: error.message }
  }
}

// Email Trigger Functions
export const emailTriggers = {
  // Signup complete
  onSignupComplete: async (user) => {
    await sendEmail('SIGNUP_COMPLETE', user.email, {
      name: user.name || 'Creator',
      email: user.email
    })
  },

  // Campaign application submitted
  onApplicationSubmitted: async (application, campaign, user) => {
    await sendEmail('APPLICATION_SUBMITTED', user.email, {
      name: user.name || 'Creator',
      campaignTitle: campaign.title,
      brandName: campaign.brand,
      rewardAmount: campaign.reward_amount
    })
  },

  // Campaign application approved
  onApplicationApproved: async (application, campaign, user) => {
    const deadline = new Date(campaign.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const shippingDate = new Date()
    shippingDate.setDate(shippingDate.getDate() + 3)

    await sendEmail('APPLICATION_APPROVED', user.email, {
      name: user.name || 'Creator',
      campaignTitle: campaign.title,
      deadline: deadline,
      shippingDate: shippingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      rewardAmount: campaign.reward_amount,
      googleDriveLink: campaign.google_drive_link,
      googleSlidesLink: campaign.google_slides_link
    })

    // Schedule deadline reminders
    await scheduleReminderEmails(campaign.id, campaign.deadline)
  },

  // Guide delivered
  onGuideDelivered: async (campaign, user) => {
    const deadline = new Date(campaign.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const shippingDate = new Date()
    shippingDate.setDate(shippingDate.getDate() + 3)

    const reminder3Days = new Date(campaign.deadline)
    reminder3Days.setDate(reminder3Days.getDate() - 3)

    const reminder1Day = new Date(campaign.deadline)
    reminder1Day.setDate(reminder1Day.getDate() - 1)

    await sendEmail('GUIDE_DELIVERED', user.email, {
      name: user.name || 'Creator',
      campaignTitle: campaign.title,
      deadline: deadline,
      shippingDate: shippingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      reminder3Days: reminder3Days.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      reminder1Day: reminder1Day.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      googleDriveLink: campaign.google_drive_link,
      googleSlidesLink: campaign.google_slides_link
    })
  },

  // Point/withdrawal request submitted
  onPointRequestSubmitted: async (pointRequest, user, bankInfo) => {
    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + 2)

    const transferDate = new Date()
    transferDate.setDate(transferDate.getDate() + 5)

    const depositDate = new Date()
    depositDate.setDate(depositDate.getDate() + 7)

    await sendEmail('POINT_REQUEST_SUBMITTED', user.email, {
      name: user.name || 'Creator',
      pointAmount: pointRequest.amount,
      amount: pointRequest.amount,
      reason: pointRequest.reason,
      bankName: bankInfo.bank_name,
      branchName: bankInfo.routing_number || bankInfo.branch_name,
      accountNumber: bankInfo.account_number,
      accountHolder: bankInfo.account_holder,
      reviewDate: reviewDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transferDate: transferDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      depositDate: depositDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
  },

  // Point transfer/deposit completed
  onPointTransferCompleted: async (transfer, user, campaign) => {
    await sendEmail('POINT_TRANSFER_COMPLETED', user.email, {
      name: user.name || 'Creator',
      amount: transfer.amount,
      transferDate: new Date(transfer.completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transactionId: transfer.transaction_id,
      bankName: transfer.bank_name,
      branchName: transfer.routing_number || transfer.branch_name,
      accountNumber: transfer.account_number,
      campaignTitle: campaign.title,
      pointAmount: transfer.point_amount,
      platform: transfer.platform || 'Instagram',
      postDate: new Date(transfer.post_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
  }
}

export default {
  sendEmail,
  scheduleReminderEmails,
  emailTriggers,
  EMAIL_TEMPLATES
}
