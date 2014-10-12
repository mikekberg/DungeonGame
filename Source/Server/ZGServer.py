from twisted.internet import protocol, reactor
from twisted.application import internet, service
from twisted.protocols import basic
from datetime import datetime
from ZGameServer import *
from ZGActionHandlers import *
import json

print dir(CommandHandler)


class ZGProtocol(basic.LineReceiver):
    def __init__(self):
        self.gameServer = MainServer
        self.setRawMode()
        self.httpHeaderResponse = "HTTP/1.1 200 OK\nContent-Type: application/json; charset=UTF-8\nDate: %s\nAccess-Control-Allow-Origin: *\nContent-Length: %i\n\n"

    def iterDictClasses(self, dictData):
        rtnDict = {}
        for key in dictData.keys():
            if hasattr(dictData[key], "__dict__"):
                rtnDict[key] = self.iterDictClasses(dictData[key].__dict__)
            elif isinstance(dictData[key], list):
                rtnDict[key] = map(lambda x: hasattr(x, "__dict__") and self.iterDictClasses(x.__dict__) or x, dictData[key])
            else:
                rtnDict[key] = dictData[key]
        return rtnDict

    def rawDataReceived(self, data):
        headerLines = data.splitlines()
        parmList = headerLines[0].split(' ')[1][2:].split('&')
        parmData = dict(map(lambda x: tuple(x.split('=')), parmList))

        if parmData.has_key("aid") and self.gameServer.functionMap.has_key(int(parmData["aid"])):
            functionResponse = self.gameServer.functionMap[int(parmData["aid"])](**parmData)
            if (functionResponse != None):
                sendData = json.dumps(self.iterDictClasses(functionResponse.__dict__))
            else:
                sendData = ""
        else:
            sendData = """[-1,[]]"""

        self.transport.write(((self.httpHeaderResponse) % (datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT"), len(sendData),)) + sendData)
        self.transport.loseConnection()

class ZGFactory(protocol.ServerFactory):
    protocol = ZGProtocol

MainServer = ZGameServer(CommandHandler())
application = service.Application('ZGame', uid=1, gid=1)
factory = ZGFactory()
internet.TCPServer(3479, factory).setServiceParent(
service.IServiceCollection(application))