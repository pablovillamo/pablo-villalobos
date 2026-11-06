function calculateRoas(revenue,cost,reserve){
 if(![revenue,cost,reserve].every(Number.isFinite)||revenue<=0||cost<0||reserve<0)return {error:'Revisá los datos: ingreso positivo y costos y reserva no negativos.'};
 const contribution=revenue-cost;
 if(contribution<=0)return {error:'Con estos costos no queda contribución para publicidad. Revisá precio y costos antes de definir un ROAS.'};
 const budget=contribution-reserve;
 return {contribution,margin:contribution/revenue,breakEven:revenue/contribution,budget,target:budget>0?revenue/budget:null};
}
if(typeof document!=='undefined'){
 const form=document.querySelector('#roas-form');
 if(form)form.addEventListener('submit',e=>{e.preventDefault();const values=['revenue','cost','reserve'].map(id=>{const v=document.getElementById(id).value;return v.trim()===''?NaN:Number(v)});const r=calculateRoas(...values);const out=document.querySelector('#roas-result');const f=n=>n.toLocaleString('es-CR',{maximumFractionDigits:2});
 out.textContent=r.error||`Margen de contribución: ${f(r.margin*100)} %. CPA de equilibrio: ${f(r.contribution)} unidades de tu moneda por pedido. ROAS de equilibrio: ${f(r.breakEven)} veces (${f(r.breakEven*100)} %). `+(r.target===null?'La reserva consume o supera la contribución: no hay presupuesto positivo disponible para publicidad.':`Para conservar tu reserva: CPA máximo ${f(r.budget)} y ROAS requerido ${f(r.target)} veces. Esa reserva debe cubrir gastos fijos y resultado; no es utilidad neta.`);
 });
}
if(typeof module!=='undefined')module.exports={calculateRoas};
