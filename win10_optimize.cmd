@echo off
rem Optimizations for a stand alone PC - no domain

rem Automatic started services
rem   Diagnostic Policy Service
rem   Offline Files
rem   Distributed Link Tracking Client
rem   IP Helper     :      iphlpsvc
rem   Connected User Experiences and Telemetry
rem   Print Spooler
rem   AMD External Events Utility
rem   HP Service
set AUTOSTARTED=DPS CscService TrkWks DiagTrack Spooler "AMD External Events Utility" hpsrv


rem Manually started services
rem   Diagnostic Service Host
rem   Diagnostic System Host
rem   WinHTTP Web Proxy Auto-Discovery Service :  WinHttpAutoProxySvc
rem   Geolocation Service
rem   Certificate Propagation
rem   Payments and NFC/SE Manager
set MANAULSTARTED=WdiServiceHost WdiSystemHost lfsvc CertPropSvc SEMgrSvc


rem Automatic delay started services
rem   Security Center
rem   Windows Update
rem   Windows Search
rem   Sync Host_1350d8
rem   Sync Host_818c9
set DELAYSTARTED=wscsvc wuauserv WSearch OneSyncSvc_1350d8 OneSyncSvc_818c9


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
