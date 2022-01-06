
export const randomTime =(min,max)=>{
  return Math.floor(Math.random()*(max-min+1)+min)
}


export const delay = (delayms) =>{
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delayms);
  })
}


