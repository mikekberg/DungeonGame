class Actions:
    ERROR = -1
    LOGIN = 0
    LOGIN_SUCCESSFUL = 1
    LOGIN_FAILED = 2
    POLL = 3
    POLL_RESPONSE = 4
    SYNC = 5
    SYNC_RESPONSE = 6
    GLOBAL_MESSAGE = 10

    # Game Actions
    MOVEMENT_VECTOR = 100
    MOVEMENT_STOP = 101

def ActionHandler(aid, logMessage="", registerAction=True):
    def HanderWrapper(meth):
        def CommandHandlerFunc(*args, **dArgs):
            self = args[0]
            dArgs.pop("aid")
            if (logMessage != ""):
                if logMessage.count("%") == 1:
                    print logMessage % (dArgs)
                else:
                    print logMessage
            rslt = meth(*args, **dArgs)
            if (registerAction):
                rslt.actionID = aid
                self.lastActionID += 1
                self.actionList.append((self.lastActionID, rslt))
            return rslt
        CommandHandlerFunc.__aid__= aid
        return CommandHandlerFunc
    return HanderWrapper

class CommandHandler:
    def __init__(self):
        self.charList = []
        self.lastCID = 0
        self.lastActionID = 0
        self.actionList= []

    @ActionHandler(Actions.LOGIN, "LOGIN MESSAGE RECEIVED ARGS(%s)")
    def Login(self, username, password):
        self.lastCID += 1
        self.charList.append((self.lastCID, username))
        return ResponseActions.LoginSuccessful(self.lastCID, self.lastActionID)

    @ActionHandler(Actions.POLL, "POLL REQUEST RECEIVED ARGS(%s)", registerAction=False)
    def Poll(self, lastActionID, cid):
        actions = map(lambda y: y[1], filter(lambda x: x[0] > int(lastActionID), self.actionList))
        return ResponseActions.PollResponse(actions, self.lastActionID)

    ## Game Events ##

    @ActionHandler(Actions.GLOBAL_MESSAGE, "GLOBAL MESSAGE RECEIVED ARGS(%s)")
    def SendGlobalMessage(self, message, cid):
        playerName = map(lambda y: y[1], filter(lambda x: x[0] == int(cid), self.charList))[0]
        return RequestActions.GlobalMessage(message, playerName)

    @ActionHandler(Actions.MOVEMENT_VECTOR, "SPRITE MOVING ARGS(%s)")
    def MovementVector(self, cid, vx, vy, x, y):
        return RequestActions.MovementVector(cid, vx, vy, x, y)

    @ActionHandler(Actions.MOVEMENT_STOP, "SPRITE STOPPED ARGS(%s)")
    def MovementStopped(self, cid, x, y):
        return RequestActions.MovementStopped(cid, x, y)


class RequestActions:
    class GlobalMessage:
        def __init__(self, msg, cname):
            self.msg = msg
            self.playerSource = cname
    class MovementVector:
        def __init__(self, cid, vx, vy, x, y):
            self.cid = cid
            self.vx = vx
            self.vy = vy
            self.x = x
            self.y = y
    class MovementStopped:
        def __init__(self, cid, x, y):
            self.cid = cid
            self.x = x
            self.y = y

class ResponseActions:
    class PollResponse:
        def __init__(self, actionList, currentActionID):
            self.actionList = actionList
            self.currentActionID = currentActionID
    class LoginSuccessful:
            def __init__(self, cid, lastActionID):
                self.cid = cid
                self.lastActionID= lastActionID