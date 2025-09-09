export const nomineeTypeDef = `
  # Form field types for nominee forms
  enum FormFieldType {
    TEXT
    TEXTAREA
    SELECT
    RADIO
    CHECKBOX
    FILE
    DATE
    NUMBER
    EMAIL
    PHONE
  }

  # Form field validation rules
  type FormFieldValidation {
    min: Int
    max: Int
    pattern: String
    errorMessage: String
  }

  # Form field definition
  type FormField {
    fieldId: String!
    fieldType: FormFieldType!
    label: String!
    placeholder: String
    required: Boolean!
    options: [String!]
    validation: FormFieldValidation
    order: Int!
  }

  # Input type for creating form fields
  input FormFieldInput {
    fieldId: String!
    fieldType: FormFieldType!
    label: String!
    placeholder: String
    required: Boolean = false
    options: [String!]
    validation: FormFieldValidationInput
    order: Int
  }

  input FormFieldValidationInput {
    min: Int
    max: Int
    pattern: String
    errorMessage: String
  }

  # Nominee form template
  type NomineeForm {
    id: ID!
    event: Event!
    category: Category!
    formFields: [FormField!]!
    isActive: Boolean!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  # Nominee type
  type Nominee {
    id: ID!
    fullName: String!
    description: String
    category: Category!
    event: Event!
    imageURL: String
    dynamicFields: JSON
    voteCount: Int!
    isActive: Boolean!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  # Nominee pagination
  type NomineePagination {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type NomineeListResponse {
    nominees: [Nominee!]!
    pagination: NomineePagination!
  }

  # Input types
  input CreateNomineeFormInput {
    eventId: ID!
    categoryId: ID!
    formFields: [FormFieldInput!]!
  }

  input CreateNomineeInput {
    fullName: String!
    description: String
    category: ID!
    event: ID!
    imageURL: String
    dynamicFields: JSON
  }

  input UpdateNomineeInput {
    fullName: String
    description: String
    imageURL: String
    dynamicFields: JSON
    isActive: Boolean
  }

  # Response types
  type NomineeFormResponse {
    code: Int!
    success: Boolean!
    message: String
    data: NomineeForm
  }

  type NomineeResponse {
    code: Int!
    success: Boolean!
    message: String
    data: Nominee
  }

  type NomineeListQueryResponse {
    code: Int!
    success: Boolean!
    message: String
    data: NomineeListResponse
  }

  type GenericResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  extend type Query {
    # Get nominee form for event/category
    getNomineeForm(eventId: ID!, categoryId: ID!): NomineeFormResponse!
    
    # Get nominees with filters and pagination
    getNominees(
      eventId: ID
      categoryId: ID
      page: Int = 1
      limit: Int = 20
      sortBy: String = "fullName"
      sortOrder: String = "asc"
    ): NomineeListQueryResponse!
    
    # Get single nominee by ID
    getNominee(nomineeId: ID!): NomineeResponse!
  }

  extend type Mutation {
    # Create nominee form template
    createNomineeForm(input: CreateNomineeFormInput!): NomineeFormResponse!
    
    # Update nominee form
    updateNomineeForm(formId: ID!, input: CreateNomineeFormInput!): NomineeFormResponse!
    
    # Create nominee
    createNominee(nominee: CreateNomineeInput!): NomineeResponse!
    
    # Update nominee
    updateNominee(nomineeId: ID!, updates: UpdateNomineeInput!): NomineeResponse!
    
    # Delete nominee (soft delete)
    deleteNominee(nomineeId: ID!): GenericResponse!
  }
`;
