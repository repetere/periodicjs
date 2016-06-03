'use strict';
/*jshint expr: true*/
const bcrypt = require('bcrypt'),
    Promisie = require('promisie'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    path = require('path'),
    periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic')),
    periodicLib = periodic({ waitformongo: true, skip_install_check: true, env: 'test', debug: false });

let periodicjs,
    testDocuments = {},
    mongoose,
    User;

chai.use(require('sinon-chai'));

describe('A module that represents a periodic app', function() {
    this.timeout(10000);
    before('initialize periodic', function(done) {
        periodicLib.init({}, function(err, periodicInitialized) {
            if (err) {
                done(err);
            } else {
                periodicjs = periodicInitialized;
                mongoose = periodicjs.mongoose;
                User = periodicjs.periodic.mongoose.model('User');
                if (mongoose.Connection.STATES.connected === mongoose.connection.readyState) {
                    done();
                } else {
                    periodicjs.mongoose.connection.on('connected', () => {
                        done();
                    });
                }
            }
        });
    });
    describe('The User Model', function() {
        before('Delete test admin users', function(done) {
            let user_emails_to_delete = [{ email: 'xxxxxxx' },
                { email: 'xxxxxxx@xxx.com' }, { email: 'passwordtest@test.com' }, { email: 'passwordtest4@test.com' }, { email: 'rantok@test.com' }, { email: 'rantok@test.com' }, { email: 'privtest@test.com' }, { email: 'fastRegisterUserTest@test.com' }, { email: 'createusertest@test.com' }
            ];

            Promise.all(user_emails_to_delete.map((testuser) => {
                    return Promisie.promisify(User.remove, User)(testuser);
                }))
                .then(( /*remove_results*/ ) => done())
                .catch((e) => {
                    console.log('remove_results e', e);
                    expect(e).to.not.be.ok;
                    done(e);
                });
        });
        it('should return a function', function(done) {
            // console.log(periodicjs.mongoose.model('User'))
            expect(User).to.be.a('function');
            done();
        });
        it('should validate a valid user', function(done) {
            let inValidUserTest = {
                username: 'testuser' + (new Date()).getTime(),
                email: 'xxxxxxx',
                firstname: 'testuser' + (new Date()).getTime()
            };
            let validUserTest = {
                username: 'testuser2' + (new Date()).getTime(),
                email: 'xxxxxxx@xxx.com',
                firstname: 'testuser2' + (new Date()).getTime()
            };
            testDocuments.Users = testDocuments.Users || [];
            testDocuments.Users.push(inValidUserTest, validUserTest);
            let testUser = new User(inValidUserTest);
            let testUser2 = new User(validUserTest);
            Promisie.promisify(testUser.save, testUser)()
                .then(() => {}, (err) => {
                    // console.log('testUser err',err);
                    expect(err).to.be.an('error');
                    return Promisie.promisify(testUser2.save, testUser2)();
                })
                .then((newUser2) => {
                    // console.log('testUser2 err',newUser2);
                    expect(newUser2).to.be.a('object');
                    done();
                })
                .catch((e) => {
                    console.log('testing valid user errors', e);
                    done(e);
                });
        });
        it('should compare passwords', function(done) {
            testDocuments.Users = testDocuments.Users || [];
            let passwordTestUser = {
                username: 'testuser3' + (new Date()).getTime(),
                email: 'passwordtest@test.com',
                firstname: 'testuser3' + (new Date()).getTime()
            };
            let testpassword = '0123456789abcdefghijklmnop';
            let testUser3;
            Promisie.promisify(bcrypt.genSalt, bcrypt)(10)
                .then((salt) => {
                    return Promisie.promisify(bcrypt.hash, bcrypt)(testpassword, salt);
                })
                .then((hash) => {
                    passwordTestUser.password = hash;
                    passwordTestUser.apikey = User.generateRandomTokenStatic();
                    testDocuments.Users.push(passwordTestUser);
                    testUser3 = new User(passwordTestUser);
                    expect(testUser3.comparePassword).to.be.a('function');
                    return Promisie.promisify(testUser3.comparePassword, testUser3)(testpassword);
                })
                .then((matched) => {
                    expect(matched).to.be.ok;
                    return Promisie.promisify(testUser3.comparePassword, testUser3)('wrong password');
                })
                .then((matched_wrong) => {
                    expect(matched_wrong).to.not.be.ok;
                    return Promisie.promisify(testUser3.comparePassword, testUser3)(undefined);
                })
                .then(() => {}, (err) => {
                    expect(err).to.be.an('error');
                    let testNoUserPassword = {
                        username: 'testuser4' + (new Date()).getTime(),
                        email: 'passwordtest4@test.com',
                        firstname: 'testuser4' + (new Date()).getTime()
                    };
                    let testUser4 = new User(testNoUserPassword);

                    return Promisie.promisify(testUser4.comparePassword, testUser4)(testpassword);
                })
                .then((no_password) => {
                    expect(no_password).to.not.be.ok;
                    let spy;
                    let spycb = function() {
                        // do something cool
                        expect(spy).to.be.spy;
                        expect(spy).to.have.been.called;
                        done();
                    };
                    spy = sinon.spy(spycb);
                    testUser3.comparePassword('wrongpassword', spy);
                })
                .catch((err) => {
                    console.log('testing compare passwords errors', err.stack);
                    done(err);
                });
        });
        it('should generate a random user token', function(done) {
            testDocuments.Users = testDocuments.Users || [];
            let randomTokenUser = {
                username: 'testuser4' + (new Date()).getTime(),
                email: 'rantok@test.com',
                firstname: 'testuser4' + (new Date()).getTime()
            };
            let testUser4;
            testDocuments.Users.push(randomTokenUser);
            testUser4 = new User(randomTokenUser);
            expect(User.generateRandomTokenStatic).to.be.a('function');
            expect(testUser4.generateRandomToken).to.be.a('function');
            let ranToken1 = testUser4.generateRandomToken();
            let ranToken2 = testUser4.generateRandomToken();
            expect(ranToken1).to.be.ok;
            expect(ranToken1).to.not.equal(ranToken2);
            done();
        });
        it('should have a valid apikey', function(done) {
            testDocuments.Users = testDocuments.Users || [];
            let validApiKeyUser = {
                username: 'testuser5' + (new Date()).getTime(),
                email: 'rantok@test.com',
                firstname: 'testuser5' + (new Date()).getTime(),
                apikey: User.generateRandomTokenStatic()
            };
            let testUser5;
            let createdUser5;
            testDocuments.Users.push(validApiKeyUser);
            testUser5 = new User(validApiKeyUser);
            expect(User.validApiKey).to.be.a('function');
            Promisie.promisify(testUser5.save, testUser5)()
                .then((createdtestUser5) => {
                    createdUser5 = createdtestUser5;
                    expect(createdtestUser5).to.be.a('object');
                    return Promisie.promisify(User.validApiKey, User)(createdtestUser5._id, createdtestUser5.apikey);
                })
                .then((found_user_by_apikey) => {
                    expect(found_user_by_apikey._id.toString()).to.equal(createdUser5._id.toString());
                    return Promisie.promisify(User.validApiKey, User)(createdUser5._id, 'wrong API key');
                })
                .then(() => {}, (err) => {
                    expect(err).to.be.an('error');
                    expect(err.message).to.equal('invalid apikey');
                    done();
                })
                .catch((e) => {
                    console.log('testing valid apikey ', e);
                    done(e);
                });
        });
        it('should test user privileges', function(done) {
            testDocuments.Users = testDocuments.Users || [];
            let testUserPrivilege = {
                username: 'testuser6' + (new Date()).getTime(),
                email: 'privtest@test.com',
                firstname: 'testuser6' + (new Date()).getTime(),
                apikey: User.generateRandomTokenStatic()
            };
            let testUser6;
            testDocuments.Users.push(testUserPrivilege);
            testUser6 = new User(testUserPrivilege);
            expect(User.hasPrivilege).to.be.a('function');
            Promisie.promisify(testUser6.save, testUser6)()
                .then((createdtestUser6) => {
                    // createdUser5 = createdtestUser6;
                    expect(createdtestUser6).to.be.a('object');
                    testUserPrivilege.accounttype = 'admin';
                    expect(User.hasPrivilege(testUserPrivilege, 900)).to.be.true;
                    testUserPrivilege.accounttype = 'basic';
                    testUserPrivilege.privileges = {
                        '1000': 'basic',
                        '2000': 'basic',
                        '3000': 'basic'
                    };

                    expect(User.hasPrivilege(testUserPrivilege, 1000)).to.be.ok;
                    expect(User.hasPrivilege(testUserPrivilege, 5000)).to.not.be.ok;
                    done();
                    // return Promisie.promisify(User.validApiKey,User)(createdtestUser6._id, createdtestUser6.apikey);
                })
                .catch((e) => {
                    console.log('testing valid apikey ', e);
                    done(e);
                });
        });
        it('should validate users', function(done) {
            let no_username = {
                checkusername: true,
                newuser: {}
            };
            let short_username = {
                checkusername: true,
                newuser: {
                    username: '123'
                }
            };
            expect(User.checkValidation).to.be.a('function');
            expect(User.checkValidation(no_username)).to.be.an('error');
            expect(User.checkValidation(no_username).message).to.equal('Username is too short');
            expect(User.checkValidation(short_username)).to.be.an('error');
            expect(User.checkValidation(short_username).message).to.equal('Username is too short');
            short_username.newuser.username = 'username1234';
            short_username.checkemail = false;
            expect(User.checkValidation(short_username)).to.not.be.an('error');
            short_username.length_of_username = 100;
            expect(User.checkValidation(short_username)).to.be.an('error');
            short_username.length_of_username = 4;
            short_username.checkemail = true;
            expect(User.checkValidation(short_username)).to.be.an('error');
            expect(User.checkValidation(short_username).message).to.equal('Invalid email');
            short_username.newuser.email = 'username1234';
            expect(User.checkValidation(short_username).message).to.equal('Invalid email');
            short_username.newuser.email = 'username1234@test.com';
            expect(User.checkValidation(short_username)).to.not.be.an('error');
            short_username.newuser.password = '123';
            expect(User.checkValidation(short_username)).to.not.be.an('error');
            short_username.checkpassword = true;
            expect(User.checkValidation(short_username)).to.be.an('error');
            expect(User.checkValidation(short_username).message).to.equal('Password is too short');
            short_username.newuser.password = '1234567890';
            expect(User.checkValidation(short_username)).to.be.an('error');
            expect(User.checkValidation(short_username).message).to.equal('Passwords do not match');
            short_username.newuser.passwordconfirm = '1234567890';
            expect(User.checkValidation(short_username)).to.be.a('null');
            short_username.length_of_password = 40;
            expect(User.checkValidation(short_username).message).to.equal('Password is too short');

            done();
        });
        it('should existing users', function(done) {
            expect(User.checkExistingUser).to.be.a('function');
            Promisie.promisify(User.checkExistingUser, User)({
                    userdata: {
                        email: 'privtest@test.com'
                    }
                })
                .then(() => {}, (err) => {
                    expect(err).to.be.an('error');
                    expect(err.message).to.equal('you already have an account');
                    return Promisie.promisify(User.checkExistingUser, User)({
                        userdata: {
                            email: `shoultnotexists${(new Date()).getTime()}email@test.com`
                        }
                    });
                })
                .then((no_user_found_message) => {
                    expect(no_user_found_message).to.equal('no existing user');
                    done();
                })
                .catch((e) => {
                    console.log('testing existing users ', e);
                    done(e);
                });
        });
        it('should fast register users', function(done) {
            expect(User.fastRegisterUser).to.be.a('function');
            let fastRegisterUserTest = {
                username: 'testuser8' + (new Date()).getTime(),
                email: 'fastRegisterUserTest@test.com',
                firstname: 'testuser8' + (new Date()).getTime()
            };
            testDocuments.Users = testDocuments.Users || [];
            testDocuments.Users.push(fastRegisterUserTest);

            Promisie.promisify(User.fastRegisterUser, User)(fastRegisterUserTest)
                .then(() => {}, (err) => {
                    expect(err).to.be.an('error');
                    expect(err.message).to.equal('missing password');
                    fastRegisterUserTest.password = '1';
                    return Promisie.promisify(User.fastRegisterUser, User)(fastRegisterUserTest);
                })
                .then(() => {}, (err) => {
                    expect(err).to.be.an('error');
                    expect(err.message).to.equal('password is too short');
                    fastRegisterUserTest.password = 'nowvalidpassword';
                    return Promisie.promisify(User.fastRegisterUser, User)(fastRegisterUserTest);
                })
                .then((newly_created_user) => {
                    // // console.log('newly_created_user',newly_created_user)
                    // expect(newly_created_user).to.be.ok;
                    // expect(newly_created_user).to.be.an('object');
                    // expect(newly_created_user.email).to.equal('fastRegisterUserTest@test.com');
                    done();
                })
                .catch((e) => {
                    console.log('testing existing users ', e);
                    done(e);
                });
        });
        it('should login In User', function(done) {
            expect(User.logInNewUser).to.be.a('function');
            let spycb = function() {
                // do something cool
                expect(spy).to.be.spy;
                expect(spy).to.have.been.called;
                done();
            };
            let spy = sinon.spy(spycb);
            let logintest = {
                newuser: {
                    email: 'loginnewuser@emailtest.com'
                },
                req: {
                    login: function(options, cb) {
                        cb(null, true);
                    }
                }
            };

            User.logInNewUser(logintest, spy);
        });
        it('should not send welcome email with errors', function(done) {
            expect(User.sendNewUserWelcomeEmail).to.be.a('function');
            let spycb = function(err, status) {
                expect(err).to.be.an('error');
                expect(spy).to.be.spy;
                expect(spy).to.have.been.called;
                done();
            };
            let spy = sinon.spy(spycb);
            let emailtest = {
                newuser: {
                    email: 'loginnewuser@emailtest.com'
                },
                req: {
                    login: function(options, cb) {
                        cb(null, true);
                    }
                }
            };

            User.sendNewUserWelcomeEmail(emailtest, spy);
        });
        it('should send welcome email', function(done) {
            expect(User.sendNewUserWelcomeEmail).to.be.a('function');
            let spycb = function(err, status) {
                // console.log('sendNewUserWelcomeEmail err,status',err,status)
                expect(status).to.be.ok;
                expect(spy).to.be.spy;
                expect(spy).to.have.been.called;
                done();
            };
            let spy = sinon.spy(spycb);
            let emailtest = {
                newuser: {
                    email: 'test@test.com'
                },
                lognewuserin: false,
                req: {},
                send_new_user_email: true,
                requireuseractivation: false,
                welcomeemaildata: {
                    getEmailTemplateFunction: periodicjs.periodic.core.controller.getPluginViewDefaultTemplate,
                    emailviewname: 'email/user/welcome',
                    themefileext: periodicjs.periodic.settings.templatefileextension,
                    sendEmailFunction: periodicjs.periodic.core.mailer.sendEmail,
                    subject: ' New User Registration',
                    from: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
                    replyto: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
                    hostname: 'test.example.com',
                    appenvironment: 'test',
                    appname: 'email-app-test'
                }
            };

            User.sendNewUserWelcomeEmail(emailtest, spy);
        });
        it('should create new users', function(done) {
            expect(User.createNewUserAccount).to.be.a('function');
            testDocuments.Users = testDocuments.Users || [];
            let testCreateUser = {
                username: 'testuser10' + (new Date()).getTime(),
                email: 'createusertest@test.com',
                password: 'createusertest@test.com',
                firstname: 'testuser10' + (new Date()).getTime()
            };
            testDocuments.Users.push(testCreateUser);
            let spycb = function(err, status) {
                // console.log('sendNewUserWelcomeEmail err,status',err,status)
                expect(status).to.be.ok;
                expect(spy).to.be.spy;
                expect(spy).to.have.been.called;
                done();
            };
            let spy = sinon.spy(spycb);
            let emailtest = {
                newuser: testCreateUser,
                lognewuserin: false,
                req: {},
                checkusername: false,
                checkpassword: false,
                send_new_user_email: true,
                requireuseractivation: false,
                welcomeemaildata: {
                    getEmailTemplateFunction: periodicjs.periodic.core.controller.getPluginViewDefaultTemplate,
                    emailviewname: 'email/user/welcome',
                    themefileext: periodicjs.periodic.settings.templatefileextension,
                    sendEmailFunction: periodicjs.periodic.core.mailer.sendEmail,
                    subject: ' New User Registration',
                    from: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
                    replyto: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
                    hostname: 'test.example.com',
                    appenvironment: 'test',
                    appname: 'email-app-test'
                }
            };

            User.createNewUserAccount(emailtest, spy);
        });
        after('Delete test admin user', function(done) {
            Promise.all(testDocuments.Users.map((testuser) => {
                    return Promisie.promisify(User.remove, User)(testuser);
                }))
                .then(( /*remove_results*/ ) => done())
                .catch((e) => {
                    console.log('remove_results e', e);
                    expect(e).to.not.be.ok;
                    done(e);
                });
        });
    });

});
