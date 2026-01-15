import os
import logging
from brevo_python import TransactionalEmailsApi, SendSmtpEmail, ApiClient, Configuration
from brevo_python.rest import ApiException

# Configure logging
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = os.environ.get('BREVO_API_KEY')
        if not self.api_key:
            logger.warning("BREVO_API_KEY not found in environment variables. Email service will not work.")
            self.api_instance = None
        else:
            configuration = Configuration()
            configuration.api_key['api-key'] = self.api_key
            api_client = ApiClient(configuration)
            self.api_instance = TransactionalEmailsApi(api_client)

    def send_transactional_email(self, to_email: str, to_name: str, template_id: int, params: dict):
        """
        Sends a transactional email using a Brevo template.
        """
        if not self.api_instance:
            logger.error("EmailService not initialized (missing API key). Skipping email send.")
            return False

        sender = {"name": "Já Comprei", "email": "nao-responda@jacomprei.app"}
        to = [{"email": to_email, "name": to_name}]

        # Create the email object
        # IMPORTANT: Do not send htmlContent or textContent when using templateId
        send_smtp_email = SendSmtpEmail(
            conversation_id=None,
            sender=sender,
            to=to,
            template_id=template_id,
            params=params,
            headers={"X-Mailin-tag": "transactional-app"}
        )

        try:
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Email sent successfully to {to_email}. Message ID: {api_response.message_id}")
            return True
        except ApiException as e:
            logger.error(f"Exception when calling TransactionalEmailsApi->send_transac_email: {e}")
            return False

    def send_welcome_email(self, to_email: str, name: str, confirm_link: str):
        """
        Wrapper specifically for the Welcome email.
        Requires BREVO_WELCOME_TEMPLATE_ID in env.
        """
        try:
            template_id = int(os.environ.get('BREVO_WELCOME_TEMPLATE_ID', 0))
        except (ValueError, TypeError):
            logger.warning("BREVO_WELCOME_TEMPLATE_ID invalid or not set.")
            return False
            
        if template_id == 0:
            logger.warning("BREVO_WELCOME_TEMPLATE_ID is 0 which likely means it's not set.")
            return False

        return self.send_transactional_email(
            to_email=to_email,
            to_name=name,
            template_id=template_id,
            params={"nome": name, "link": confirm_link}
        )

    def send_password_recovery_email(self, to_email: str, name: str, reset_link: str):
        """
        Wrapper for Password Recovery email.
        Requires BREVO_RESET_TEMPLATE_ID in env.
        """
        try:
            template_id = int(os.environ.get('BREVO_RESET_TEMPLATE_ID', 0))
        except (ValueError, TypeError):
            logger.warning("BREVO_RESET_TEMPLATE_ID invalid or not set.")
            return False
            
        if template_id == 0:
            logger.warning("BREVO_RESET_TEMPLATE_ID is 0 which likely means it's not set.")
            return False

        return self.send_transactional_email(
            to_email=to_email,
            to_name=name,
            template_id=template_id,
            params={"nome": name, "link": reset_link}
        )

# Singleton instance
email_service = EmailService()
