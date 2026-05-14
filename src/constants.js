// Port and environment
const port = process.env.PORT || 8001;
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = isProduction ? process.env.FRONTEND_URL : "http://localhost:3000";

// Cors options
const corsOptions = {
    origin:[process.env.ORIGIN, "http://localhost:3000", "https://department-institutions-hero-implementing.trycloudflare.com", "https://www.suburbsays.com.au"],
    credentials:true,
    methods:["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
};

// Cookie options
const cookieOptions = {
    httpOnly:true,
    secure: isProduction,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 90,
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction ? ".beneighbourly.com.au" : "http://localhost:3000"
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