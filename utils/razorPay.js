
const fetchPaymentFromRazorpay = async (paymentId) => {
    try {
        // ✅ Basic Auth with your key id and secret
        const auth = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_SECRET}`
        ).toString('base64');

        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Razorpay API error: ${response.status}`);
        }

        const paymentData = await response.json();
        return paymentData;
        
    } catch (err) {
        console.error("Error fetching payment from Razorpay:", err);
        return null;
    }
};

const razor_pay = {fetchPaymentFromRazorpay};
export default razor_pay;