import { IgApiClient } from 'instagram-private-api';
import readline from 'readline/promises';
import 'dotenv/config';
import moment from 'moment';
import { stdin as input, stdout as output } from 'process';

const ig = new IgApiClient();

async function login() {
    ig.state.generateDevice(process.env.IG_USERNAME);

    try {
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    } catch (error) {
        if (error.name === 'IgLoginTwoFactorRequiredError') {
            const rl = readline.createInterface({ input, output });
            const twoFactorCode = await rl.question('Enter your two-factor code: ');
            rl.close();

            const { username, two_factor_identifier } = error.response.body.two_factor_info;
            console.log("Login Successful");
            return ig.account.twoFactorLogin({
                username,
                verificationCode: twoFactorCode,
                twoFactorIdentifier: two_factor_identifier,
                trustThisDevice: '1',
                verificationMethod: '0'
            });
        } else {
            console.error("Login failed:", error);
        }
    }
}

async function getMessages() {
    await login();
    const inbox = ig.feed.directInbox();
    const messages = await inbox.items();

    messages.map((message, i) => {
        console.log(`ThreadID: ${message.thread_id}`); 
        let date = moment(Number(message.last_permanent_item.timestamp) / 1000);
        console.log(`Conversation with: ${message.thread_title}`);
        console.log(`Received at: ${date}`);
        console.log(`Message: ${message.last_permanent_item.text}`);
    })
    return inbox;
}


getMessages();

