# Express Host for HestiaCP with custom nginx configuration
Works with all CMS available 

## Description
This is an Express.js application that serves as a dynamic host for your directories and their subdirectories. It provides a visual interface for navigating through your file structure, with each folder and subfolder represented by an icon and a link.

When you navigate to the root URL, the application displays all of your directories and their subdirectories. If you navigate to a specific folder (e.g., "/folderName"), the application displays only that folder and its subfolders. If you navigate to a specific subfolder (e.g., "/folderName/subfolderName"), the application displays only that subfolder.

## Installation
1. Clone the repository:

`git clone https://github.com/HarleyVader/express-host.git /home/<user>/web/<website>/`

Replace `<user>` with your username and `<website>` with the name of your website.

2. Navigate to the `nginx` directory in the cloned repository:

`cd /home/<user>/web/<website>/express-host/nginx`

3. Change the permissions of the `nginx` directory to make install.sh executable:
   asign 

`chmod 777 -R nginx`
`chown -R <user>:<user> nginx` 

4. Run the `install.sh` script to create a custom `nginx.conf_port` at `/home/<user>/conf/<website>/`
if run succesfully it will create 2 files nginx.conf_<port> & nginx.ssl.conf_<port> based on the template nginx.conf_melkanea by replacing <user> <port> <URL> 
it works as hestiaCP default nginx.conf has an include section so no need to edit anything, no need to expose certificates or use https

`sudo ./install.sh <user> <port> <URL>` (<URL> its the exposed URI of where the express-host will render its content, can be anything & i love it stupid simple)

after install.sh was 100% succesfull
`sudo systemctl restart nginx`

4. Requirements to run the express-host
   [nvm](https://github.com/nvm-sh/nvm)
   after installation run `nvm -v` to check if instalation was succesfull
   `nvm install node` to get latest nodejs & npm versions
   [pm2](https://www.npmjs.com/package/pm2)
  `npm install pm2@latest -g`

## Usage

After installation, you can start the Express Host application by running the following command in the root directory of the project:
  `node app.js` once its running stable & you have checked it out at your <website><URL> then close it & run PM2

  `pm2 start app.js` then
  `pm2 list` to see if app.js didnt error out (look at restarts count!!!)
  `pm2 save` to save config
  `pm2 startup` to restart app.js after system reboot

This will start the express-host, and you can navigate to `https://<website><URL>` in your web browser to view your directories and their subdirectories.


## Contributing
[melkanea](https://github.com/HarleyVader)
[Copilot](https://copilot.microsoft.com/)
