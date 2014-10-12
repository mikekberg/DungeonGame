class ZGameServer:
    def __init__(self, mapHandler):
        self.cmdHandler = mapHandler
        self.functionMap= {}

        handlerMethods = [method for method in dir(mapHandler) if callable(getattr(mapHandler, method)) and hasattr(getattr(mapHandler, method), "__aid__")]
        for m in handlerMethods:
            method = getattr(mapHandler, m)
            self.functionMap[method.__aid__] = method