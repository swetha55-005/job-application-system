const listen = (app, port) => {
    app.listen(port, () => 
    {
        console.log(`server is running ${port}`);
    });
};


module.exports = listen;