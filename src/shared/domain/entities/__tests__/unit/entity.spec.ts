import { validate as validateUUID } from 'uuid'
import { Entity } from '../../entity'

type StubProps = {
  prop1: string
  prop2: number
}

class StubEntity extends Entity<StubProps> {}

describe('Entity unit tests', () => {
  it('Should accept a valid uuid', () => {
    const props: StubProps = {
      prop1: 'prop1',
      prop2: 1,
    }
    const id = '0565b4e9-5999-4da5-9082-a07406e3341d'
    const entity = new StubEntity(props, id)

    expect(validateUUID(entity._id)).toBeTruthy()
    expect(entity._id).toBe(id)
  })

  it('Should set props and id', () => {
    const props: StubProps = {
      prop1: 'prop1',
      prop2: 1,
    }
    const entity = new StubEntity(props)

    expect(entity.props).toEqual(props)
    expect(entity._id).not.toBeNull()
  })

  it('Should convert a entity to a JSON object', () => {
    const props: StubProps = {
      prop1: 'prop1',
      prop2: 1,
    }
    const id = '0565b4e9-5999-4da5-9082-a07406e3341d'
    const entity = new StubEntity(props, id)

    expect(entity.toJSON()).toStrictEqual({
      id,
      ...props,
    })
  })
})
