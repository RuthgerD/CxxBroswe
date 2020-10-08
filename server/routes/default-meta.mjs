import express from 'express';

export function check_method_allowed(router) {
    return async (req, res, next) => {
/*      FIXME find a way to see all relevant routes
        const methods = Object.assign({},
            ...router.stack
                .filter(layer => layer.route)
                .filter(layer => layer.route.path == req.path || (layer.path && req.path.endsWith(layer.path)))
                .map(layer => layer.route.methods)
        );

        console.log(methods);

        if(Object.keys(methods).length > 0 && !methods[req.method.toLowerCase()]){
            res.set('Allow', Object.keys(methods).map(s => s.toUpperCase()).reduce((a, b) => (`${a}, ${b}`)));
            return res.status(405).end();
        }
*/
        next();
    }
}

export default function(Controller) {
    const router = express.Router();

    router.use('/:id', check_method_allowed(router));
    router.use('/:id', Controller.verify_id);

    router.get('/:id', Controller.get);
    router.put('/:id', Controller.update);
    router.delete('/:id', Controller.remove);



    router.use('/', check_method_allowed(router));

    router.post('/', Controller.create);
    router.get('/', Controller.list);
    router.delete('/', Controller.prune);


    return router;
};
