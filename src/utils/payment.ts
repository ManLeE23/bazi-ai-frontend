import { fetchWechatPayment } from '@/api/services';

interface PaymentParams {
  amount_total: number; // Unit: cents
  description: string;
  mode?: string;
  openid?: string;
  code?: string;
}

export const handleWechatPayment = async (
  params: PaymentParams,
): Promise<void> => {
  try {
    // 1. Call backend API to get payment parameters
    const res: any = await fetchWechatPayment({
      amount_total: params.amount_total,
      // amount_total: 1, // Commented out debug value
      description: params.description,
      currency: 'CNY',
      mode: params.mode,
      openid: params.openid,
      code: params.code,
    });

    if (!res || !res.data) {
      throw new Error('获取支付参数失败');
    }

    const paymentData = res.data.pay_params || res.data;

    // 2. Call uni.requestPayment
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'wxpay',
        // For App payment, orderInfo is required. For MP-WEIXIN, these fields are used.
        // We add orderInfo to satisfy TypeScript, but it might be ignored by MP platform.
        orderInfo: JSON.stringify({
          appid: paymentData.appId || '',
          noncestr: paymentData.nonceStr,
          package: paymentData.package,
          partnerid: paymentData.partnerId || '',
          prepayid: paymentData.prepayId || '',
          timestamp: paymentData.timeStamp,
          sign: paymentData.paySign,
        }),
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType || 'MD5',
        paySign: paymentData.paySign,
        success: function (res: any) {
          console.log('success:' + JSON.stringify(res));
          resolve();
        },
        fail: function (err: any) {
          console.log('fail:' + JSON.stringify(err));
          // User cancelled or error
          if (err.errMsg.indexOf('cancel') !== -1) {
            reject(new Error('支付已取消'));
          } else {
            reject(new Error('支付失败: ' + (err.errMsg || '未知错误')));
          }
        },
      } as any);
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    throw error;
  }
};
