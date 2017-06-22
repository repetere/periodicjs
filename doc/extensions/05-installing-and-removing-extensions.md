# Installing extensions - `$ periodicjs addExtension [name-of-extension]` 

Periodic extensions are regular node modules, so to install a new extension use npm (or yarn) to install your extension and then add the extension to your application's extension database.

```console
$ cd path/to/application_root
$ npm i [name-of-extension]
$ periodicjs addExtension [name-of-extension]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=ext --crud_op=create --crud_arg=[name-of-extension] 
```

# Removing extensions - `$ periodicjs removeExtension [name-of-extension]` 

Similarly, to remove an extension, use npm (or yarn) to remove the extension and also remove the extension from your application's extension db.

```console
$ cd path/to/application_root
$ npm i [name-of-extension]
$ periodicjs removeExtension [name-of-extension]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=ext --crud_op=remove --crud_arg=[name-of-extension] 
```

NEXT: [ Configuring Extensions ](https://github.com/typesettin/periodicjs/blob/master/doc/extensions/06-configuring-extensions.md)
