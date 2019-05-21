import Faq from './model'
import extendApp from './app'
import Fuse from 'fuse.js'

export const name = 'Bot skill: FAQ'
export const description = 'Respond to any keywords user defined with corresponding answer'
export const homepage = 'https://github.com/rc-personal-bot-framework/ringcentral-personal-chatbot-skill-fuzzy-matching-faq#readme'

export const onPostAdd = async ({
  text, // original text
  textFiltered, // text without metion user
  group,
  user,
  handled, // hanlded by prev skills
  shouldUseSignature // should use signature like "send by bot skill xxx" in message.
}) => {
  if (handled) {
    return false
  }
  let faqs = await Faq.findAll({
    where: {
      user_id: user.id
    }
  }).map(r => r.get({
    plain: true
  }))
  let options = {
    shouldSort: true,
    includeScore: true,
    threshold: 0.1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'answer', 'keywords'
    ]
  }
  let fuse = new Fuse(faqs, options)
  let splits = textFiltered.split(/\s+/g)
  let res = []
  for (let s of splits) {
    res.push(
      fuse.search(s)
    )
  }
  let str = res.map(d => ('* ' + d.answer).join('\n'))
  if (res) {
    let sign = shouldUseSignature
      ? `(send by [${exports.name}](${exports.homepage}))`
      : ''
    await user.sendMessage(group.id, {
      text: str + sign
    })
    return true
  } else {
    return false
  }
}

export const appExtend = extendApp
export const settingPath = '/skill/fuzzy-matching-faq/setting'
