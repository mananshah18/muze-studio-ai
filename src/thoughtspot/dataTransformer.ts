import { ChartModel, ColumnType } from './types';

/**
 * Transforms ThoughtSpot chart data into a format suitable for Muze
 * @param chartModel The ThoughtSpot chart model
 * @returns Data in a format suitable for Muze
 */
export function transformDataForMuze(chartModel: ChartModel) {
  if (!chartModel || !chartModel.data || chartModel.data.length === 0) {
    console.warn('transformDataForMuze: Invalid chart model or empty data');
    return [];
  }

  const chartData = chartModel.data[0];
  const columns = chartData.columns;
  const data = chartData.data;
  
  // Create an array of objects where each object represents a row of data
  const transformedData = [];
  
  // Determine the number of rows based on the first data array's length
  const rowCount = data[0]?.length || 0;
  
  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, any> = {};
    
    // For each column, add the corresponding data value to the row
    for (let j = 0; j < columns.length; j++) {
      const column = columns[j];
      const value = data[j]?.[i];
      
      row[column.name] = value;
    }
    
    transformedData.push(row);
  }
  
  console.log(`transformDataForMuze: Transformed ${rowCount} rows of data`);
  return transformedData;
}

/**
 * Gets column metadata from the ThoughtSpot chart model
 * @param chartModel The ThoughtSpot chart model
 * @returns An object with measure and attribute columns
 */
export function getColumnMetadata(chartModel: ChartModel) {
  const columns = chartModel.columns || [];
  
  const measures = columns.filter(col => col.type === ColumnType.MEASURE);
  const attributes = columns.filter(col => col.type === ColumnType.ATTRIBUTE);
  const dates = columns.filter(col => col.type === ColumnType.DATE);
  
  console.log(`getColumnMetadata: Found ${measures.length} measures, ${attributes.length} attributes, ${dates.length} dates`);
  
  return {
    measures,
    attributes,
    dates,
    all: columns
  };
}

/**
 * Generates a default Muze configuration based on ThoughtSpot data
 * @param chartModel The ThoughtSpot chart model
 * @returns A configuration object for Muze
 */
export function generateDefaultMuzeConfig(chartModel: ChartModel) {
  const { measures, attributes, dates } = getColumnMetadata(chartModel);
  
  // Default to using the first measure for values and first attribute for categories
  const valueField = measures.length > 0 ? measures[0].name : '';
  const categoryField = attributes.length > 0 ? attributes[0].name : '';
  const dateField = dates.length > 0 ? dates[0].name : '';
  
  console.log(`generateDefaultMuzeConfig: Using value=${valueField}, category=${categoryField}, date=${dateField}`);
  
  return {
    rows: [valueField],
    columns: [categoryField || dateField],
    data: transformDataForMuze(chartModel)
  };
}

/**
 * Creates a Muze schema from ThoughtSpot column metadata
 * @param chartModel The ThoughtSpot chart model
 * @returns A schema array for Muze DataModel
 */
export function createMuzeSchema(chartModel: ChartModel) {
  const { measures, attributes, dates } = getColumnMetadata(chartModel);
  
  const schema = [
    ...measures.map(col => ({
      name: col.name,
      type: 'measure',
      defAggFn: 'sum'
    })),
    ...attributes.map(col => ({
      name: col.name,
      type: 'dimension'
    })),
    ...dates.map(col => ({
      name: col.name,
      type: 'dimension',
      subtype: 'temporal'
    }))
  ];
  
  console.log(`createMuzeSchema: Created schema with ${schema.length} fields`);
  return schema;
} 