const fs=require('node:fs');
const ts=require('typescript5');
const assert=require('node:assert/strict');
const [beforePath,afterPath,output]=process.argv.slice(2);
function rootName(node){
 if(ts.isIdentifier(node))return node.text;
 if(ts.isPropertyAccessExpression(node)||ts.isElementAccessExpression(node))return rootName(node.expression);
 if(ts.isCallExpression(node))return rootName(node.expression);
 return '';
}
function inventory(file){
 const source=fs.readFileSync(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const assertions=[],titles=[];let testDefinitions=0;
 const visit=n=>{
  if(ts.isCallExpression(n)){
   const root=rootName(n.expression);
   if(root==='expect')assertions.push(n.getText(sf));
   if(['it','test','describe'].includes(root)&&n.arguments.some(a=>ts.isArrowFunction(a)||ts.isFunctionExpression(a))){
    const title=n.arguments[0];testDefinitions++;
    // Compare decoded literal bytes: a Unicode escape is allowed only as an equivalent spelling.
    titles.push(ts.isStringLiteralLike(title)?title.text:title.getText(sf));
   }
  }
  ts.forEachChild(n,visit);
 };visit(sf);
 return {assertions:assertions.sort(),titles:titles.sort(),testDefinitions};
}
const before=inventory(beforePath),after=inventory(afterPath);assert.deepEqual(after,before,'lint refactor changed assertion bytes, title bytes or test definitions');
fs.writeFileSync(output,JSON.stringify({before:beforePath,after:afterPath,assertionNodes:before.assertions.length,testDefinitions:before.testDefinitions,assertions_byte_identical:true,decoded_titles_byte_identical:true,no_test_removals:true,inventory:before},null,2)+'\n');
console.log('PASS: lint-only whole-file assertion/title inventory unchanged');
