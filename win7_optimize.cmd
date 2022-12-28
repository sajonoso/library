@echo off
rem Optimizations for a stand alone PC - no domain

rem Automatic started services
rem   Diagnostic Policy Service
rem   Offline Files
rem   Distributed Link Tracking Client
rem   Themes
rem   IP Helper   :   iphlpsvc 
rem   Desktop Window Manager Session Manager (aero glass)
set AUTOSTARTED=DPS CscService TrkWks Themes UxSms


rem Manually started services
rem   Diagnostic Service Host
rem   Diagnostic System Host
rem   WinHTTP Web Proxy Auto-Discovery Service     :    WinHttpAutoProxySvc
set MANAULSTARTED=WdiServiceHost WdiSystemHost


rem Automatic delay started services
rem   Security Center
rem   Windows Update
rem   Windows Search
set DELAYSTARTED=wscsvc wuauserv WSearch


if "%1"=="restore" goto :restoresc

for %%s in (%AUTOSTARTED% %MANULSTARTED% %DELAYSTARTED%) do (
  echo %%s
  sc stop %%s
  sc config %%s start= disabled
)
goto :EOF


:restoresc
for %%s in (%AUTOSTARTED%) do (
  echo Restoring %%s
  sc config %%s start= auto
)
for %%s in (%MANULSTARTED%) do (
  echo Restoring %%s
  sc config %%s start= demand
)
for %%s in (%DELAYSTARTED%) do (
  echo Restoring %%s
  sc config %%s start= delayed-auto
)
