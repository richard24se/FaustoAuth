
import XLSX from 'xlsx';

function sleeper(ms) {
    return function(x) {
      return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
}
function sleeper_action(ms, action) {
    setTimeout(() => {action()}, ms)
}

const capitalize = (s) => {
  //console.log(typeof s)
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLocaleLowerCase()
}

const getJSONExcel = (target, fun, headers=1) =>{
  const fileReader = new FileReader();
  //verify if binary or buffer
  const rABS = !!fileReader.readAsBinaryString;
  //console.log(file.target.files[0])
  //const name = target.accept.includes('image') ? 'images' : 'videos';

  //fileReader.readAsDataURL(target.files[0]);
  fileReader.onload = (e) => {
    //console.log(e.target.result)
    /* Parse data */
    const bstr = e.target.result;
    const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array'});
    /* Get first worksheet */
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    //console.log(ws)
    /* Convert array of arrays */
    var data = [];
    if(headers !== 1){
      data = XLSX.utils.sheet_to_json(ws, {range:1, header:headers});
    }else{
      data = XLSX.utils.sheet_to_json(ws, {header:headers});
    }
    
    /* Update state */
    console.log(data)
    /* Execute function */
    if(typeof fun === "function"){
      fun(data)
    }
    
  };
  //fileReader.readAsArrayBuffer(file.target.files[0]);
  if(rABS) fileReader.readAsBinaryString(target.files[0]); else fileReader.readAsArrayBuffer(target.files[0]);
}


export { sleeper, sleeper_action, capitalize, getJSONExcel }
