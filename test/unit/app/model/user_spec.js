'use strict';
/*jshint expr: true*/
const bcrypt = require('bcrypt');
const Promisie = require('promisie');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;
var path = require('path'),
  periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic.js')),
  periodicLib = periodic({waitformongo:true,skip_install_check:true,env:'test',debug:false}),
  periodicjs,
  User,
  testDocuments={},
  mongoose;

describe('A module that represents a periodic app', function () {
  this.timeout(10000);
  before('initialize periodic',function(done){
    periodicLib.init({},function(err,periodicInitialized){
      if(err){
        done(err);
      }
      else{
        periodicjs = periodicInitialized;
        mongoose = periodicjs.mongoose;
        User = periodicjs.periodic.mongoose.model('User');
        if(mongoose.Connection.STATES.connected === mongoose.connection.readyState){
          done();
        }
        periodicjs.mongoose.connection.on('connected',()=>{
          // console.log('Object.keys(periodicjs.mongoose.models)',Object.keys(periodicjs.mongoose.models))
          done();
        });
      }
    });
  });
  describe('The User Model', function () {
    it('should return a function', function (done) {
      // console.log(periodicjs.mongoose.model('User'))
      expect(User).to.be.a('function');
      done();
    });

    it('should validate a valid user', function (done) {
      let inValidUserTest = {
        username:'testuser'+(new Date()).getTime(),
        email:'xxxxxxx',
        firstname:'testuser'+(new Date()).getTime()
      };
      let validUserTest = {
        username:'testuser2'+(new Date()).getTime(),
        email:'xxxxxxx@xxx.com',
        firstname:'testuser2'+(new Date()).getTime()
      };
      testDocuments.Users = testDocuments.Users || [];
      testDocuments.Users.push(inValidUserTest,validUserTest);
      let testUser = new User(inValidUserTest);
      let testUser2 = new User(validUserTest);
      Promisie.promisify(testUser.save,testUser)()
        .then(()=>{},(err)=>{
          // console.log('testUser err',err);
          expect(err).to.be.an('error');
          return Promisie.promisify(testUser2.save,testUser2)();
        })
        .then((newUser2)=>{
          // console.log('testUser2 err',newUser2);
          expect(newUser2).to.be.a('object');
          done();
        })
        .catch((e)=>{
          console.log('testing valid user errors',e);
          done(e);
        });
    });
    it('should compare passwords',function(done){
      testDocuments.Users = testDocuments.Users || [];
      let passwordTestUser = {
        username:'testuser3'+(new Date()).getTime(),
        email:'passwordtest@test.com',
        firstname:'testuser3'+(new Date()).getTime()
      };
      let testpassword = '0123456789abcdefghijklmnop';
      let testUser3;
      Promisie.promisify(bcrypt.genSalt,bcrypt)(10)
        .then((salt)=>{
          return Promisie.promisify(bcrypt.hash,bcrypt)(testpassword,salt);
        })
        .then((hash)=>{
          passwordTestUser.password = hash;
          passwordTestUser.apikey = User.generateRandomTokenStatic();
          testDocuments.Users.push(passwordTestUser);
          testUser3 = new User(passwordTestUser);
          expect(testUser3.comparePassword).to.be.a('function');
          return Promisie.promisify(testUser3.comparePassword,testUser3)(testpassword);
        })
        .then((matched)=>{
          expect(matched).to.be.ok;
          return Promisie.promisify(testUser3.comparePassword,testUser3)('wrong password');
        })
        .then((matched_wrong)=>{
          expect(matched_wrong).to.not.be.ok;
          return Promisie.promisify(testUser3.comparePassword,testUser3)(undefined);
        })
        .then(()=>{},(err)=>{
          expect(err).to.be.an('error');
          let testNoUserPassword = {
            username:'testuser4'+(new Date()).getTime(),
            email:'passwordtest4@test.com',
            firstname:'testuser4'+(new Date()).getTime()
          };
          let  testUser4 = new User(testNoUserPassword);

          return Promisie.promisify(testUser4.comparePassword,testUser4)(testpassword);
        })
        .then((no_password)=>{
          expect(no_password).to.not.be.ok;
          done();
          let spy;
          let spycb = function() {
            // do something cool
            expect(spy).to.be.spy;
            expect(spy).to.have.been.called();
            done();
          };
          spy = chai.spy(spycb);
          
          testUser3.comparePassword('wrongpassword',spy);
        })
        .catch((err)=>{
          console.log('testing compare passwords errors',err.stack);
          done(err);
        });
    });
    it('should generate a random user token',function(done){
      testDocuments.Users = testDocuments.Users || [];
      let randomTokenUser = {
        username:'testuser4'+(new Date()).getTime(),
        email:'rantok@test.com',
        firstname:'testuser4'+(new Date()).getTime()
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
    it('should have a valid apikey',function(done){
      testDocuments.Users = testDocuments.Users || [];
      let validApiKeyUser = {
        username:'testuser5'+(new Date()).getTime(),
        email:'rantok@test.com',
        firstname:'testuser5'+(new Date()).getTime(),
        apikey: User.generateRandomTokenStatic()
      };
      let testUser5;
      let createdUser5;
      testDocuments.Users.push(validApiKeyUser);
      testUser5 = new User(validApiKeyUser);
      expect(User.validApiKey).to.be.a('function');
      Promisie.promisify(testUser5.save,testUser5)()
        .then((createdtestUser5)=>{
          createdUser5 = createdtestUser5;
          expect(createdtestUser5).to.be.a('object');
          return Promisie.promisify(User.validApiKey,User)(createdtestUser5._id, createdtestUser5.apikey);
        })
        .then((found_user_by_apikey)=>{
          expect(found_user_by_apikey._id.toString()).to.equal(createdUser5._id.toString());
          return Promisie.promisify(User.validApiKey,User)(createdUser5._id, 'wrong API key');
        })
        .then(()=>{},(err)=>{
          expect(err).to.be.an('error');
          expect(err.message).to.equal('invalid apikey');
          done();
        })
        .catch((e)=>{
          console.log('testing valid apikey ',e);
          done(e);
        });
    });
    it('should validate users',function(done){
      let no_username = {
        checkusername:true,
        newuser:{}
      };
      let short_username = {
        checkusername:true,
        newuser:{
          username:'123'
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
    after('Delete test admin user', function (done) {
        Promise.all(testDocuments.Users.map((testuser)=>{
          return Promisie.promisify(User.remove,User)(testuser);
        }))
        .then((/*remove_results*/)=>done())
        .catch((e)=>{ 
          console.log('remove_results e',e);
          expect(e).to.not.be.ok;
          done(e);
        });
      });
  });

});
