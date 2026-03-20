-- ============================================
-- Update Email Templates to English for US Platform
-- ============================================

-- Delete existing templates
DELETE FROM email_templates;

-- Insert English email templates
INSERT INTO email_templates (template_type, subject_template, html_template, variables, is_active) VALUES

-- 1. Signup Complete Email
('SIGNUP_COMPLETE', 
 'Welcome to CNEC United States!', 
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CNEC!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Thank you for joining CNEC United States. Your registration is complete!</p>
      <p>You can now:</p>
      <ul>
        <li>Browse and apply for exciting campaigns</li>
        <li>Connect with top brands</li>
        <li>Earn points and rewards</li>
      </ul>
      <a href="https://cnec-us.com/campaigns" class="button">Browse Campaigns</a>
      <p style="margin-top: 30px; color: #666;">If you have any questions, feel free to contact our support team.</p>
    </div>
  </div>
</body>
</html>', 
 '{"name": "string", "email": "string"}',
 true),

-- 2. Application Submitted Email
('APPLICATION_SUBMITTED', 
 'Campaign Application Received - {{campaignTitle}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .campaign-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .highlight { color: #667eea; font-weight: bold; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Submitted!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Thank you for applying to the campaign:</p>
      <div class="campaign-info">
        <h3>{{campaignTitle}}</h3>
        <p><strong>Brand:</strong> {{brandName}}</p>
        <p><strong>Reward:</strong> <span class="highlight">${{rewardAmount}}</span></p>
      </div>
      <p>Your application has been received and is currently under review. We will notify you once a decision has been made.</p>
      <p style="margin-top: 30px; color: #666;"><strong>What happens next?</strong></p>
      <ol>
        <li>Our team will review your application</li>
        <li>You will receive an email notification with the decision</li>
        <li>If approved, you will receive campaign materials and instructions</li>
      </ol>
      <p style="margin-top: 30px; color: #999; font-size: 14px;">This usually takes 1-3 business days.</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "campaignTitle": "string", "brandName": "string", "rewardAmount": "number"}',
 true),

-- 3. Application Approved Email
('APPLICATION_APPROVED', 
 'Congratulations! Your Application is Approved - {{campaignTitle}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .highlight { color: #10b981; font-weight: bold; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <div class="success-badge">APPLICATION APPROVED</div>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Great news! You have been selected for:</p>
      <h3 style="color: #667eea; font-size: 20px;">{{campaignTitle}}</h3>
      <p><strong>Reward Amount:</strong> <span class="highlight">${{rewardAmount}}</span></p>
      <p><strong>Campaign Deadline:</strong> {{deadline}}</p>
      
      <h3 style="margin-top: 30px;">Next Steps:</h3>
      <ol>
        <li>Review the campaign materials and requirements</li>
        <li>Create and post your content according to guidelines</li>
        <li>Submit your content URLs through your dashboard</li>
        <li>Receive your reward once content is verified</li>
      </ol>
      
      <a href="https://cnec-us.com/my-page" class="button">Go to My Dashboard</a>
      
      <p style="margin-top: 30px; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
        <strong>⚠️ Important:</strong> Please complete and submit your content before the deadline to receive your reward.
      </p>
      
      <p style="margin-top: 30px; color: #666;">If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}',
 true),

-- 4. Application Rejected Email
('APPLICATION_REJECTED', 
 'Campaign Application Update - {{campaignTitle}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Thank you for your interest in: <strong>{{campaignTitle}}</strong></p>
      <p>Unfortunately, we are unable to approve your application for this campaign at this time. This may be due to:</p>
      <ul>
        <li>Campaign capacity has been reached</li>
        <li>Profile requirements did not match campaign needs</li>
        <li>Other campaign-specific criteria</li>
      </ul>
      <p>Please don''t be discouraged! We have many other exciting campaigns available.</p>
      <a href="https://cnec-us.com/campaigns" class="button">Browse Other Campaigns</a>
      <p style="margin-top: 30px; color: #666;">Thank you for being part of the CNEC community!</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "campaignTitle": "string"}',
 true),

-- 5. Content Submitted Email
('CONTENT_SUBMITTED', 
 'Content Submitted for Review - {{campaignTitle}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Content Received!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Your content for <strong>{{campaignTitle}}</strong> has been successfully submitted!</p>
      <p>Our team will review your submission and verify it meets the campaign requirements.</p>
      <p><strong>What happens next:</strong></p>
      <ol>
        <li>Content review (1-2 business days)</li>
        <li>Approval notification</li>
        <li>Reward points credited to your account</li>
      </ol>
      <p style="margin-top: 30px; color: #666;">Thank you for your participation!</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "campaignTitle": "string"}',
 true),

-- 6. Withdrawal Request Submitted
('WITHDRAWAL_SUBMITTED', 
 'Withdrawal Request Received',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight { color: #667eea; font-weight: bold; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Withdrawal Request</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Your withdrawal request has been received and is being processed.</p>
      <p><strong>Amount:</strong> <span class="highlight">${{amount}}</span></p>
      <p><strong>PayPal Email:</strong> {{paypalEmail}}</p>
      <p>Your payment will be processed within 3-5 business days.</p>
      <p style="margin-top: 30px; color: #666;">You will receive a confirmation email once the payment has been sent.</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "amount": "number", "paypalEmail": "string"}',
 true),

-- 7. Withdrawal Completed
('WITHDRAWAL_COMPLETED', 
 'Withdrawal Completed - Payment Sent',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight { color: #10b981; font-weight: bold; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Payment Sent!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Great news! Your withdrawal has been completed.</p>
      <p><strong>Amount:</strong> <span class="highlight">${{amount}}</span></p>
      <p><strong>PayPal Email:</strong> {{paypalEmail}}</p>
      <p><strong>Transaction ID:</strong> {{transactionId}}</p>
      <p>The payment has been sent to your PayPal account. Please allow 1-2 business days for the funds to appear in your account.</p>
      <p style="margin-top: 30px; color: #666;">Thank you for being part of CNEC!</p>
    </div>
  </div>
</body>
</html>',
 '{"name": "string", "amount": "number", "paypalEmail": "string", "transactionId": "string"}',
 true);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Email templates updated to English!' as result;
SELECT COUNT(*) as template_count FROM email_templates;

