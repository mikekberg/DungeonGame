@echo off
set PYTHONPATH=%CD%;%PYTHONPATH%
%PYTHON_ROOT%\Scripts\twistd.py -y ZGServer.py --rundir=./