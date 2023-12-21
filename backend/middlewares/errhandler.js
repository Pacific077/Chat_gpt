const Apperr = (err,req,res,next)=>{
    const statusCode = res.statusCode=== 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message:err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    })
}

export default Apperr;