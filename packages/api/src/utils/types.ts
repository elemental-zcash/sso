export type SnakeToCamelCase<Key extends string> = Key extends `${infer FirstPart}_${infer FirstLetter}${infer LastPart}`
  ? `${FirstPart}${Uppercase<FirstLetter>}${SnakeToCamelCase<LastPart>}`
  : Key;

export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}` ?
  `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}` :
  S

type ExcludeProps = '__meta' | 'getTableName' | 'objects' | 'save'
  | 'Meta' | 'getMeta' | 'getFields' | 'getPrimaryKeyFields'
  | 'getJoinFields' | 'getInnerJoin' | 'getCs';

// `get${Capitalize<string & Property>}`
// Exclude<Property, ExcludeProps>

type ModelTypeMapping<Type> = Type extends { __type: 'string' }
  ? string
  : Type extends { __type: 'number' }
    ? number
    : Type extends { __type: 'boolean' }
      ? boolean
      : Type extends { __type: 'Date' }
        ? Date
        : unknown;

export type ModelToSnakeCase<Type> = {
  [Property in keyof Type as `${CamelToSnakeCase<string & Exclude<Property, ExcludeProps>>}`]: ModelTypeMapping<Type[Property]>;
}

export type ModelToType<Type> = {
  [Property in keyof Type as `${string & Exclude<Property, ExcludeProps>}`]: ModelTypeMapping<Type[Property]>;
}
