public class SendEmail {
	public static void emailCredentials(String url, String code, String un, String pw) {
		String userEmailAddress = UserInfo.getUserEmail();

		Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
		mail.setToAddresses(new List<String>{ userEmailAddress });
		mail.setReplyTo(userEmailAddress);
		mail.setSenderDisplayName('oAuth Demo');
		mail.setSubject('Please login to complete the oAuth demo');
		mail.setBccSender(false);
		mail.setUseSignature(false);
		// mail.setPlainTextBody('Your Case: ' + case.Id + ' has been created.');
		String body = '';
		body += '<table>';
		body += '<tr><th>Url</th><td><a href="' + url + '">' + url + '</a></td></tr>';
		body += '<tr><th>Code</th><td>' + code + '</td></tr>';
		body += '<tr><th>Username</th><td>' + un + '</td></tr>';
		body += '<tr><th>Password</th><td>' + pw + '</td></tr>';
		body += '</table>';
		mail.setHtmlBody(body);
		Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });
	}
}
