import requestify from 'requestify'

const getGhPatch = async (req, res) => {
  console.log(req)
  if (!req.params.id) { res.status(404) }
  const ret = await requestify.get(`https://patch-diff.githubusercontent.com/raw/cplusplus/draft/pull/${req.params.id}.patch`).then(res => res.getBody()).fail(_ => null)
  if (!res) { res.status(404) }
  res.status(200).json(ret)
}

export default getGhPatch