
type logLevel = "info" | "error" | "warn";

export const logger ={
    log:(level:logLevel, message:string, context?:Record<string, unknown>)=>
    {
        const logMessage = `[${level.toUpperCase()}] ${message}`;
        console[level](logMessage,context || "");
    },

    //Info log
    info:(message:string, context?:Record<string, unknown>)=>
    {
        logger.log("info",message, context)
    },
    //Warn log
    warn:(message:string, context?:Record<string, unknown>)=>
    {
        logger.log("warn",message, context)
    },
    //Error log
    error:(message:string, context?:Record<string, unknown>)=>
    {
        logger.log("error",message, context)
    },


}
