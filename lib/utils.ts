import { PaginateAble, Paginated } from "../types/misc";
import { JSDOM } from 'jsdom'

export const handlePagination = async (callback: any, initUrl: string):Promise<Paginated>=> {
  let batchData=[];
  let baseUrl= initUrl;
  var finished=false;
  do {
    const { data, meta }= await callback.get(initUrl);
    data.forEach(entry => {
      batchData.push(entry)
    })
    if(meta.pagination.links.next){
      initUrl=baseUrl+meta.pagination.links.next;
    }else{
      finished=true
    }
  } while (!finished);
  return { data: batchData }
}

export const stripHTML=(text)=>{
  let container = new JSDOM(`<!DOCTYPE html><div>${text}</div>`)
  return (container.window.document.querySelector("div").textContent || container.window.document.querySelector("div").innerText)
}