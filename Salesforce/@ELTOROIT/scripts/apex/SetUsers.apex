// sfdx force:apex:execute -f ./@ELTOROIT/scripts/apex/SetUsers.apex

// Find me
User me = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];

// Enable debug mode for the default scratch org user
me.UserPreferencesUserDebugModePref = true;
update me;

// Create other users
List<User> users = new List<User>();
String usernameRandomBit = String.valueOf(Math.random()).substring(2, 14);
List<Profile> profiles = [SELECT Id, Name FROM Profile WHERE Name LIKE 'ET%'];
System.assert(profiles.size() == 2);

for (Profile p : profiles) {
	switch on p.Name {
		when 'ET Standard User' {
			users.add(new User(Alias = 'NOIP', Email = 'etDemo@mailinator.com', FirstName = 'User', LastName = 'NO IP Range', ProfileId = p.Id));
		}
		when 'ET Standard User With IP Login' {
			// IP Range: 0.0.0.0 - 255.255.255.255
			users.add(new User(Alias = 'ANYWHERE', Email = 'etDemo@mailinator.com', FirstName = 'User', LastName = 'Anywhere', ProfileId = p.Id));
		}
		when else {
			System.assert(false, P.Name + ' was not expected');
		}
	}
}

// Populate other fields
for (User u : users) {
	u.CommunityNickname = u.Alias + '.' + usernameRandomBit + '.awtraining';
	u.EmailEncodingKey = 'ISO-8859-1';
	u.LanguageLocaleKey = 'en_US';
	u.LocaleSidKey = 'en_US';
	u.TimeZoneSidKey = 'America/Los_Angeles';
	u.Username = u.Alias + '@' + usernameRandomBit + '.' + 'awtraining.com';
}

// Perform the DML
insert users;

String password = 'tdx21';
for (User u : users) {
	System.setPassword(u.Id, password);
	System.debug(URL.getSalesforceBaseUrl().toExternalForm() + '/?un=' + u.Username + '&pw=' + password);
}

/*
List<User> users = [SELECT Id FROM User WHERE IsActive = true AND Profile.Name Like 'ET%'];
for (User u : users) {
    u.IsActive = false;
}
update users;
*/

