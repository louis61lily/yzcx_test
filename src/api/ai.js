import axios from 'axios';

export const getIntroduceService = (cityStr) => {
    console.log(cityStr, 999999);

    const formData = new FormData();
    formData.append('city', cityStr);

    const urlSearchParams = new URLSearchParams(formData);

    return axios.get('http://1.94.66.195:9197/ai/getIntroduce', {
        params: urlSearchParams
    });
};