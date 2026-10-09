@echo off
setlocal

set "MAVEN_CMD=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd"

if not exist "%MAVEN_CMD%" (
  echo Maven was not found in the local Maven wrapper cache.
  exit /b 1
)

call "%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%
