const listen = async (app) => {
    try {
        const PORT = process.env.PORT;

        if (!app) {
            throw new Error("App is missing");
        }

        if (!PORT) {
            throw new Error("Port is missing");
        }

        app.listen(PORT, () => {
            console.log(`Server is running on the port ${PORT}`);
        });

    } catch (err) {
        console.log(err.message);
    }
};

module.exports = listen;