@echo off
set dbpath=D:\mongodb\data
rem set logpath=D:\mongodb\log
if not exist "%ProgramFiles%\MongoDB\Server\3.4\bin\mongod.exe" goto end 
echo mongodb Start....... 

if not exist "%dbpath%" mkdir %dbpath%
rem if not exist "%logpath%" mkdir %logpath%
cd %ProgramFiles%\MongoDB\Server\3.4\bin\
rem mongod -dbpath "D:\db" --install --serviceName "MongoDB" 
rem net start MongoDB
rem mongod --dbpath=%dbpath% --logpath=%logpath%\mongodb.log
mongod --dbpath=%dbpath% 

pause
exit

:end
echo mongodb not install 

pause
exit
