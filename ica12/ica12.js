let newBtn = document.querySelector('#js-new-qoute');
newBtn.addEventListener('click', getQuote);

const endpoint = 'https://trivia.cyberwisp.com/getrandomchristmasquestion';
 async function getQuote(){
    try{
       const response = await fetch(endpoint);
       if (!response.ok){
        throw Error (respone.statusText);
       } 
       const jason = await respinse.jasoon();
       console.log (jason);
       displayQuote(jason['question']);
    } 
    catch (err){
        console.log(err)
        alert('Failed to fetch now qoute');
    }
}
function displayQuote (quote){
    const quoteText = document.querySelector
    ('#js-qoute-text');
    quoteText.textContent= quote;
}