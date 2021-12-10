import * as path from 'path';
import * as child_process from 'child_process';
import { file as tempFile } from 'tmp-promise'
import fs, { unlinkSync } from 'fs';
import { Erd, IErdArgs } from 'src/service/erd';

export interface IGraphvizArgs extends IErdArgs {
  layout?: string;
  layouts?: string[];
  savepath?: string;
}

export class Graphviz extends Erd {
  static layouts: { [key: string]: string } = {
    circo: "sep = 2 \n esep = 2 \n weight = 20.0 \n fontSize = 28.0 \n penwidth = 20.0 \n",
    fdp: "sep=2 \n esep=2 \n weight=2 \n penwidth=3",
    twopi: "",
    dot: "",
  };
  layout = 'fdp';

  constructor(args: IGraphvizArgs) {
    super(args);
  }

  /**
   * If this.savepath exists, graph is created there, or returned.
   */
  async graphviz(knownas?: string | string[]): Promise<string | undefined> {
    this.logger.debug(`Enter useGraphviz`);

    let savepath;
    let cleanup;
    let rv;

    if (this.savepath) {
      savepath = this.savepath;
    } else {
      const temp = await tempFile();
      savepath = temp.path
      cleanup = temp.cleanup;
    }

    await this.getPredicates(knownas);

    const dotGraph = await this._predicates2graph();

    const tempOutputPath = path.resolve(
      path.join(this.tmpDir, 'temp.dot'),
    );

    fs.writeFileSync(tempOutputPath, dotGraph);

    child_process.execSync(
      `dot -T${this.format} ${tempOutputPath} > ${savepath} `
    );

    unlinkSync(tempOutputPath);

    if (cleanup) {
      rv = fs.readFileSync(savepath, 'utf-8');
      cleanup();
    }

    return rv;
  }

  async _predicates2graph(): Promise<string> {
    let graph = `digraph  G {
  layout=${this.layout}
  title="As of ${new Date().toLocaleDateString()}"
  stylesheet="../styles.css"
  fontsize="48pt"
  ${Graphviz.layouts[this.layout]}
  `;

    this.logger.debug(`Predicates: "${this.predicates}"`);

    this.predicates.forEach((predicate) => {
      try {
        if (predicate.Subject.id && predicate.Verb.id && predicate.Object.id) {

          let verbLabel = predicate.Verb.name;
          if (predicate.start || predicate.end) {
            verbLabel += " (";
            if (predicate.start) {
              verbLabel += predicate.start.getUTCFullYear().toString();
            }
            verbLabel += '-';
            if (predicate.end) {
              verbLabel += predicate.end.getUTCFullYear().toString();
            }
            verbLabel += ')';
          }

          graph += `
Entity${predicate.Subject.id} [class=entity label=<${predicate.Subject.formalname}>]
Entity${predicate.Object.id} [class=entity label=<${predicate.Object.formalname}>]
Entity${predicate.Subject.id} -> Entity${predicate.Object.id} [class=verb label=<${verbLabel}>] `;
        }
      } catch (e) {
        this.logger.error('Predicate was:', predicate);
        throw e;
      }
    });

    graph += "\n}\n"; // EOF

    this.logger.debug(`Graph: "${graph}"`);

    return graph;
  }
}
