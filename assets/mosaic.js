import { wasmConnector } from 'https://www.unpkg.com/@uwdata/mosaic-core@0.12.2/dist/mosaic-core.min.js';
import { createAPIContext } from 'https://www.unpkg.com/@uwdata/vgplot@0.12.2/dist/vgplot.min.js';
import { parseSpec, astToDOM } from 'https://www.unpkg.com/@uwdata/mosaic-spec@0.12.2/dist/mosaic-spec.min.js';
import yaml from 'https://www.unpkg.com/yaml@2.6.1/browser/index.js';


const vg = createAPIContext();
const { coordinator, namedPlots } = vg.context;


// make API accesible for console debugging
self.vg = vg;

// enable query interface
self.query = async (sql) => {
  const r = await vg.coordinator().databaseConnector().query({
    type: 'arrow',
    sql
  });
  return r.toArray();
}


let wasm;


export async function load(specURL, baseURL, viewElement, yamlElement) {
  const loader1 = document.createElement('div');
  loader1.classList.add('loader');
  viewElement.replaceChildren(loader1);
  const loader2 = document.createElement('div');
  loader2.classList.add('loader');
  yamlElement.replaceChildren(loader2);

  const specContent = await fetch(specURL).then(res => res.text())
  const spec = yaml.parse(specContent);
  let connector = wasm || (wasm = wasmConnector());
  coordinator.databaseConnector(connector);

  // options for output generation
  const options = { baseURL };

  // parse and load spec
  const ast = parseSpec(spec);
  coordinator.clear();
  namedPlots.clear();
  const dash = await astToDOM(ast, { ...options, api: vg });

  const title = document.createElement('h4');
  title.innerText = (spec.meta && spec.meta.title) ? spec.meta.title : '';

  const p = document.createElement('p');
  p.innerText = (spec.meta && spec.meta.description) ? spec.meta.description : '';

  const code = document.createElement('code');
  code.innerText = specContent;

  viewElement.replaceChildren(title, p, dash.element);
  yamlElement.replaceChildren(code);
}
