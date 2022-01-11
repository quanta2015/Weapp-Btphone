
export const randomTime =(min,max)=>{
  return Math.floor(Math.random()*(max-min+1)+min)
}


export const delay = (delayms) =>{
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delayms);
  })
}

export const fspc = (s) =>{
  var pattern = new RegExp("[\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%]") 
  var rs = ""; 
  for (var i = 0; i < s.length; i++) { 
      rs = rs+s.substr(i, 1).replace(pattern, ''); 
  } 
  return rs; 
}
