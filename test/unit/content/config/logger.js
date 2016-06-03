'use strict';
/*jshint expr: true*/
const path = require('path'),
    Logger = require(path.resolve(__dirname, '../../../../content/config/logger')),
    fs = require('fs-extra'),
    chai = require('chai'),
    expect = require('chai').expect;

chai.use(require('@yawetse/chai-fs'));

describe('A customizible winston logger', function () {
    it('should return a winston logger', function (done) {
        let winstonlogger = new Logger('test');
        expect(winstonlogger).to.be.an('object');
        // expect(winstonlogger.loggerConfig).to.be.an('object');
        done();
    });
    it('should ensure that a logging directory exists', function (done) {
        fs.readdir(path.join(process.cwd(), 'logs'), function (err, files) {
            expect(err).to.be.null;
            expect(files).to.be.an('array');
            done();
        });
    });
    it('should be customizible by environment', function (done) {
        let winstonlogger = new Logger('production');
        if (winstonlogger.exceptionHandlers && winstonlogger.exceptionHandlers.file && winstonlogger.exceptionHandlers.file.filename) {
            expect(winstonlogger.exceptionHandlers.file.filename.split('-')[0]).to.equal('production');
        }
        done();
    });
});
