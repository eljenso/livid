#! /bin/sh

echo 'Installing node'
curl -sL https://deb.nodesource.com/setup_0.10 | sudo bash -
sudo apt-get install -y nodejs
sudo npm install --global npm

echo 'Installing mongoDB'
wget https://github.com/tjanson/mongodb-armhf-deb/releases/download/v2.1.1-1/mongodb_2.1.1_armhf.deb -P /tmp/
sudo dpkg -i /tmp/mongodb_2.1.1_armhf.deb
sudo /etc/init.d/mongodb start
sudo update-rc.d mongodb defaults

echo 'Installing gulp & bower'
sudo npm install --global gulp bower


echo 'Installing mopidy repo'
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
echo '# Mopidy APT archive' | sudo tee -a /etc/apt/sources.list.d/mopidy.list
echo 'deb http://apt.mopidy.com/ wheezy main contrib non-free' | sudo tee -a /etc/apt/sources.list.d/mopidy.list
echo 'deb-src http://apt.mopidy.com/ wheezy main contrib non-free' | sudo tee -a /etc/apt/sources.list.d/mopidy.list

echo 'Installing mopidy'
sudo modprobe ipv6
echo ipv6 | sudo tee -a /etc/modules
sudo amixer cset numid=3 1
sudo apt-get update
sudo apt-get install -y mopidy mopidy-spotify

echo 'Done.'