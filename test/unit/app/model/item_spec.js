'use strict';
/*jshint expr: true*/
const bcrypt = require('bcrypt'),
    Promisie = require('promisie'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    path = require('path'),
    periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic.js')),
    periodicLib = periodic({waitformongo: true, skip_install_check: true, env: 'test', debug: false});

let periodicjs,
    testDocuments = {},
    mongoose,
    Item;

chai.use(require('sinon-chai'));

describe('A module that represents a periodic app', function () {
    this.timeout(10000);
    before('initialize periodic', function (done) {
        periodicLib.init({}, function (err, periodicInitialized) {
            if (err) {
                done(err);
            } else {
                periodicjs = periodicInitialized;
                mongoose = periodicjs.mongoose;
                Item = periodicjs.periodic.mongoose.model('Item');
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
    describe('The Item Model', function () {
        before('Delete test items', function (done) {
            let items_to_delete = [{name: 'test_item_0293401943208942304'}];

            Promise.all(items_to_delete.map((testitem) => {
                return Promisie.promisify(Item.remove, Item)(testitem);
            }))
                .then((/*remove_results*/) => done())
                .catch((e) => {
                    console.log('remove_results e', e);
                    expect(e).to.not.be.ok;
                    done(e);
                });
        });
        it('should return a function', function (done) {
            // console.log(periodicjs.mongoose.model('Item'))
            expect(Item).to.be.a('function');
            done();
        });
        it('should validate a valid item', function (done) {
            let inValidItemTest = {
                name: '',
            };
            let valideItem = {
                name: 'test_item_0293401943208942304',
            };
            testDocuments.Items = testDocuments.Items || [];
            testDocuments.Items.push(valideItem);
            let testItem = new Item(inValidItemTest);
            let testItem2 = new Item(valideItem);

            Promisie.promisify(testItem.save, testItem)()
                .then(() => {
                }, (err) => {
                    // console.log('testItem err',err);
                    expect(err).to.be.an('error');
                    return Promisie.promisify(testItem2.save, testItem2)();
                })
                .then((newItem2) => {
                    // console.log('testItem2 err',newItem2);
                    expect(newItem2).to.be.a('object');
                    done();
                })
                .catch((e) => {
                    console.log('testing valid user errors', e);
                    done(e);
                });
        });
        // it('should send welcome email',function(done){
        //   expect(Item.sendNewItemWelcomeEmail).to.be.a('function');
        //   let spycb = function(err,status) {
        //     // console.log('sendNewItemWelcomeEmail err,status',err,status)
        //     expect(status).to.be.ok;
        //     expect(spy).to.be.spy;
        //     expect(spy).to.have.been.called;
        //     done();
        //   };
        //   let spy = sinon.spy(spycb);
        //   let emailtest = {
        //     newuser: {
        //       email: 'test@test.com'
        //     },
        //     lognewuserin: false,
        //     req: {},
        //     send_new_user_email: true,
        //     requireuseractivation: false,
        //     welcomeemaildata: {
        //       getEmailTemplateFunction: periodicjs.periodic.core.controller.getPluginViewDefaultTemplate,
        //       emailviewname: 'email/user/welcome',
        //       themefileext: periodicjs.periodic.settings.templatefileextension,
        //       sendEmailFunction: periodicjs.periodic.core.mailer.sendEmail,
        //       subject: ' New Item Registration',
        //       from: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
        //       replyto: periodicjs.periodic.settings.fromemail || periodicjs.periodic.settings.adminnotificationemail,
        //       hostname: 'test.example.com',
        //       appenvironment: 'test',
        //       appname: 'email-app-test',
        //     }
        //   };

        //   Item.sendNewItemWelcomeEmail(emailtest,spy);
        // });
        after('Delete test items', function (done) {
            Promise.all(testDocuments.Items.map((testitem) => {
                return Promisie.promisify(Item.remove, Item)(testitem);
            }))
                .then((/*remove_results*/) => done())
                .catch((e) => {
                    console.log('remove_results e', e);
                    expect(e).to.not.be.ok;
                    done(e);
                });
        });
    });

});
