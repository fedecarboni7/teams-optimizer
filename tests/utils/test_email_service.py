import pytest
from unittest.mock import Mock, patch
from app.utils.email_service import EmailService


class TestEmailService:
    """Test email service username formatting"""
    
    @patch('app.utils.email_service.sib_api_v3_sdk.TransactionalEmailsApi')
    def test_password_reset_email_username_bold(self, mock_api):
        """Test that username appears in bold in password reset email"""
        # Setup mock
        mock_instance = Mock()
        mock_api.return_value = mock_instance
        
        email_service = EmailService()
        username = "testuser"
        to_email = "test@example.com"
        reset_token = "test_token_123"
        
        # Call the method
        result = email_service.send_password_reset_email(to_email, reset_token, username)
        
        # Verify the email was sent
        assert mock_instance.send_transac_email.called
        
        # Get the email object that was sent
        call_args = mock_instance.send_transac_email.call_args
        email_obj = call_args[0][0]
        
        # Verify username is in bold in HTML content
        assert f"<strong>{username}</strong>" in email_obj.html_content
        assert f"Hola <strong>{username}</strong>" in email_obj.html_content
    
    @patch('app.utils.email_service.sib_api_v3_sdk.TransactionalEmailsApi')
    def test_email_confirmation_username_bold(self, mock_api):
        """Test that username appears in bold in confirmation email"""
        # Setup mock
        mock_instance = Mock()
        mock_api.return_value = mock_instance
        
        email_service = EmailService()
        username = "newuser"
        to_email = "newuser@example.com"
        confirmation_token = "confirm_token_456"
        
        # Call the method
        result = email_service.send_email_confirmation(to_email, confirmation_token, username)
        
        # Verify the email was sent
        assert mock_instance.send_transac_email.called
        
        # Get the email object that was sent
        call_args = mock_instance.send_transac_email.call_args
        email_obj = call_args[0][0]
        
        # Verify username is in bold in HTML content
        assert f"<strong>{username}</strong>" in email_obj.html_content
        assert f"Hola <strong>{username}</strong>" in email_obj.html_content
