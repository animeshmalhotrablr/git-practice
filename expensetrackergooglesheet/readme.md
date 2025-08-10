1. Create google sheet with column names: id date description category payment_mode person amount

Set Up the Google Sheets API
Create a Google Cloud Project: Go to the Google Cloud Console and create a new project.

Enable the Google Sheets API: In your new project, navigate to "APIs & Services" -> "Library" and search for "Google Sheets API." Enable it.

Create a Service Account: Go to "APIs & Services" -> "Credentials." Create a new Service Account. Give it a name and a role (e.g., "Editor" is sufficient for this task). After creation, click on the service account and go to "Keys." Create a new JSON key. This key file will be downloaded to your computer; keep it secure.

Share Your Google Sheet: Create a new Google Sheet. The sheet must have the same column headers as your MySQL table (Date, Description, Category, etc.). Share this sheet with the email address of your service account. This email can be found in your downloaded JSON key file.

The 403 Permission Denied error means your service account does not have permission to access the Google Sheet. This is a very common issue and is easy to fix.

You need to explicitly share your Google Sheet with the email address of the service account you created.

How to Fix the Error
Find the Service Account Email: Open the JSON key file you downloaded in a text editor. Find the value for the client_email key. It will look something like your-service-account-name@your-project-id.iam.gserviceaccount.com. Copy this entire email address.

Share the Google Sheet:

Go to your Google Sheet in your web browser.

Click the "Share" button in the top-right corner.

Paste the service account email you copied into the "Add people and groups" field.

Set the permission level to "Editor".

Click "Done".
