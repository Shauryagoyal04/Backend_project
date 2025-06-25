import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    const response = {
        uptime: `${process.uptime().toFixed(2)} seconds`,
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(
        new ApiResponse(200, response, "Server is healthy 🚀")
    );
});


export {
    healthcheck
    }
    