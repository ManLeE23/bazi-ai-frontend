import { fetchWechatPayment, fetchMBTIWechatPayment } from '@/api/services';

interface PaymentParams {
  amount_total: number; // Unit: cents
  description: string;
  mode?: number;
  openid?: string;
  code?: string;
}

export const processWechatPaymentData = (
  paymentData: any,
  outTradeNo: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeStampStr = String(paymentData.timeStamp);

    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: JSON.stringify({
        appid: paymentData.appId || '',
        noncestr: paymentData.nonceStr,
        package: paymentData.package,
        partnerid: paymentData.partnerId || '',
        prepayid: paymentData.prepayId || '',
        timestamp: timeStampStr,
        sign: paymentData.paySign,
      }),
      timeStamp: timeStampStr,
      nonceStr: paymentData.nonceStr,
      package: paymentData.package,
      signType: paymentData.signType || 'MD5',
      paySign: paymentData.paySign,
      success: (res: any) => {
        console.log('Payment success callback:', res);
        settled = true;
        resolve(outTradeNo);
      },
      fail: (err: any) => {
        console.error('Payment fail callback:', err);
        settled = true;
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          reject(new Error('支付已取消'));
        } else {
          reject(new Error('支付失败: ' + (err.errMsg || '未知错误')));
        }
      },
      complete: (res: any) => {
        console.log('Payment complete callback:', res);
        uni.hideLoading();
        if (!settled) {
          reject(new Error('支付流程结束，但未收到结果'));
        }
      },
    } as any);
  });
};

export const handleWechatPayment = async (
  params: PaymentParams,
): Promise<string | undefined> => {
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

    console.log('res', res);

    const paymentData = res.data.pay_params || res.data;
    const outTradeNo = res.data.out_trade_no;

    // 2. Call uni.requestPayment
    return processWechatPaymentData(paymentData, outTradeNo);
  } catch (error: any) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const handleMBTIWechatPayment = async (params: {
  amount_total: number;
  description: string;
  currency?: string;
  code: string;
  report_id: string;
}): Promise<string | undefined> => {
  try {
    const res: any = await fetchMBTIWechatPayment({
      amount_total: params.amount_total,
      description: params.description,
      currency: params.currency || 'CNY',
      code: params.code,
      report_id: params.report_id,
    });

    if (!res || !res.data) {
      throw new Error('获取支付参数失败');
    }

    const paymentData = res.data.pay_params || res.data;
    const outTradeNo = res.data.out_trade_no;

    return processWechatPaymentData(paymentData, outTradeNo);
  } catch (error: any) {
    console.error('MBTI Payment error:', error);
    throw error;
  }
};
