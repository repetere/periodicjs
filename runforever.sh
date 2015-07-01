exec 2> /home/ubuntu/runforever.log

/usr/local/bin/forever start -o logs/app-out.forever.log -e logs/app-err.forever.log -c nodemon index.js
