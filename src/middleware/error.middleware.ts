function errorHandler(error: Error, context: any) {
    // You can also add more context information here if needed, such as the message or user details.
    if (error.reason){
        console.error("Error reason:", error.reason);
    }
    else {
        console.error("Error occurred during message processing:", error);
    }
}
export default errorHandler;