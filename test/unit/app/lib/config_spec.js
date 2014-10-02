var config = require('../../../../app/lib/config.js')
    chai = require('chai'),
    expect = require('chai').expect,
    cwd = process.cwd();
    chai.use(require('chai-fs'));

configuration = new config();

//console.log(configuration)


describe('A module that loads configurations for express and periodic',function () {
  describe('The config object',function () {
    it('should be an object',function (done) {
      expect(configuration).to.be.an('object');
      done();
    });
    it('should have an intial json config file',function (done) {
      var defaultPath = configuration.getConfigFilePath('default');
      expect(defaultPath).to.be.a.file().and.not.empty;
      done();
    });
    it('should be able to parse json config files',function (done) {
       var defaultPath = configuration.getConfigFilePath('default'),
           envPath = configuration.getConfigFilePath('development');
       expect(defaultPath).to.be.a.file().with.json;
       expect(envPath).to.be.a.file().with.json;
       done();
    });
    it('should give you a method to set a config setting',function (done) {
        configuration.setConfig('hello','world');
        expect(configuration).to.have.property('hello');
        done();
    });
  });
});
