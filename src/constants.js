// Port and environment
const port = process.env.PORT || 8001;
const isProduction = process.env.NODE_ENV === "production";
const isStaging = process.env.NODE_ENV === "staging";
const isLocal = process.env.NODE_ENV === "development";
const frontendUrl = process.env.FRONTEND_URL;

// Cors options
const corsOptions = {
    origin:[
        process.env.ORIGIN, 
        frontendUrl,
        "http://localhost:3000", 
        "https://www.suburbsays.com.au", 
        "https://neighbourly-admin-panel-frontend.vercel.app",
        "https://admin.suburbsays.com.au"
    ],
    credentials:true,
    methods:["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
};

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: !isLocal,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 90,
    sameSite: isLocal ? "lax" : "none"
};

// Empty list
const emptyList = { 
    docs:[], 
    totalPages:0, 
    totalDocs:0, 
    limit:0, 
    page:0, 
    pagingCounter:0, 
    hasPrevPage:false, 
    hasNextPage:false, 
    prevPage:null, 
    nextPage:null 
};

module.exports = {
    port,
    isProduction,
    frontendUrl,
    corsOptions,
    cookieOptions,
    emptyList
};