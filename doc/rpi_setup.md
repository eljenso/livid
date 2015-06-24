# How to setup on a Raspberry Pi #
*This is only tested on a Rasperry Pi 2*  
I assume that [Raspbian](https://www.raspbian.org/) 'wheezy' was installed and configured to the personal needs.  
This how-to works with a vanilla Raspbian installation.

## Update rasbian and firmware ##
Make sure the system is up to date:
```
sudo apt-get update
sudo apt-get dist-upgrade -y
sudo rpi-update
sudo reboot
```

## Install requirements ##
*Alternatively you can execute the [rpi2_raspbianWheezy.sh](install/rpi2_raspbianWheezy.sh) which will install all the dependencies listed below*

First we need to install the dependencies:
* node.js v0.10.x
* mongoDB
* gulp & bower
* mopidy

### Installing node ###
First we install a decent repository for node (taken from [here](https://nodesource.com/blog/nodejs-v012-iojs-and-the-nodesource-linux-repositories#node-js-v0-10)):  
`curl -sL https://deb.nodesource.com/setup_0.10 | sudo bash -`

And then install node:  
`sudo apt-get install -y nodejs`

Make sure the latest version of npm is installed:  
`sudo npm install --global npm`


### Installing mongoDB ###
This is a bit tricky since there is no official build of mongoDB for the Pi.  
We'll use a 3rd party package.  
Remember that you should *never* use packageds from an unknown source when deploying a productive system.  
But since this is for personal use we'll use this package anyway.

Download, install & setup:  
```
wget https://github.com/tjanson/mongodb-armhf-deb/releases/download/v2.1.1-1/mongodb_2.1.1_armhf.deb
sudo dpkg -i mongodb_2.1.1_armhf.deb
sudo /etc/init.d/mongodb start
```

(Optional) add mongoDB to autostart:   
`sudo update-rc.d mongodb defaults`

### Installing gulp & bower ###
This is simple:
```
sudo npm install --global gulp bower
```

### Installing mopidy ###
The [official guide](https://docs.mopidy.com/en/latest/installation/raspberrypi/#how-to-for-raspbian-wheezy-and-debian-wheezy) for installing mopidy on the Pi stats that you should execute the following commands for a proper mopidy setup:
```
sudo modprobe ipv6
echo ipv6 | sudo tee -a /etc/modules
```

If you want sound output via the analog output, execute:
```
sudo amixer cset numid=3 1
```

And test with
```
aplay /usr/share/sounds/alsa/Front_Center.wav
```

Now, to install mopidy:
```
# Add the archive’s GPG key
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -

# Add the repo
echo '# Mopidy APT archive' | sudo tee -a /etc/apt/sources.list.d/mopidy.list
echo 'deb http://apt.mopidy.com/ wheezy main contrib non-free' | sudo tee -a /etc/apt/sources.list.d/mopidy.list
echo 'deb-src http://apt.mopidy.com/ wheezy main contrib non-free' | sudo tee -a /etc/apt/sources.list.d/mopidy.list

# Install mopidy
sudo apt-get update
sudo apt-get install -y mopidy mopidy-spotify
```

## Setting up mopidy ##
To initialize the mopidy config file, simply run `mopidy`, wait a few seconds (there might be some errors, ignore them for now) and stop with *Ctrl+C*.  
Now open at the file `~/.config/mopidy/mopidy.conf` with your favorite editor.

This file is seperated into section, each starting with `[SECTION]`.  Lines starting with a # are comments and do not have any effect.

For a pure spotify setup, we'll need to make changes to the spotify section.  
Uncomment (e.g. remove the #) from `enabled`, `username` and `password`.  
Set `enabled` to `true` and fill in username and password.  
If you want you can also set the bitrate to 320 (don't forget to uncomment).

As of yet, local files are not supported, therefore they have to be disabled in mopidy. Uncomment the `enabled` line in the local section and set it to `false`.

Start mopidy again.  
There should be no errors and mopidy should successfully connect to spotify and load your playlists.


## Install and setup Parti Q ##
Pull the repo:
```
git clone https://github.com/eljenso/parti-q.git
```

Setup Parti Q:
```
cd parti-q
npm install
bower install
```

Lastly, change the playlist in `config.js` by changing `defaultPlaylist` to your needs.




## Troubleshouting ##

If you encounter any audio quality issues, look [here](https://docs.mopidy.com/en/latest/installation/raspberrypi/#appendix-a-fixing-audio-quality-issues).